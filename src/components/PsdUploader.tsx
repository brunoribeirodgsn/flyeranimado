"use client";

import { useCallback, useRef, useState } from "react";
import type { PsdDocument, PsdLayer } from "@/types/psd";
import { DEFAULT_ANIMATION } from "@/types/psd";
import { storeLayerCanvas, clearLayerPixelStore } from "@/lib/layerPixelStore";

// ag-psd é importado dinamicamente para evitar SSR
interface PsdReadResult {
  width: number;
  height: number;
  colorMode?: number; // 3 = RGB, 4 = CMYK, etc.
  children?: PsdChild[];
}

interface PsdChild {
  name?: string;
  hidden?: boolean;
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
  canvas?: HTMLCanvasElement;
  imageData?: ImageData; // present when useImageData: true
  blendMode?: string;
  children?: PsdChild[];
}

let layerCounter = 0;

/**
 * Given a canvas from ag-psd, creates a clean normalised copy.
 * Redrawing via drawImage() in a brand-new canvas fixes:
 *  - premultiplied-alpha artefacts
 *  - CMYK channel mis-ordering in some ag-psd builds
 */
function cloneCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const dst = document.createElement("canvas");
  dst.width = src.width;
  dst.height = src.height;
  const ctx = dst.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, dst.width, dst.height);
    ctx.drawImage(src, 0, 0);
  }
  return dst;
}

/**
 * Converts a raw ImageData (straight RGBA) into a canvas.
 * This is the cleanest path — no premultiplied-alpha involved.
 */
function imageDataToCanvas(imgData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Creates a small thumbnail (max 120px on longest side) from a canvas,
 * returned as a base64 PNG. This tiny string is the ONLY pixel data stored
 * in React state — full-res pixels live in layerPixelStore.
 */
function makeThumbnail(src: HTMLCanvasElement, maxSize = 120): string {
  const scale = Math.min(maxSize / src.width, maxSize / src.height, 1);
  const tw = Math.max(1, Math.round(src.width * scale));
  const th = Math.max(1, Math.round(src.height * scale));
  const thumb = document.createElement("canvas");
  thumb.width = tw;
  thumb.height = th;
  const ctx = thumb.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, tw, th);
    ctx.drawImage(src, 0, 0, tw, th);
  }
  return thumb.toDataURL("image/png");
}

function flattenLayers(children: PsdChild[], parentVisible = true): PsdLayer[] {
  const result: PsdLayer[] = [];
  for (const child of children) {
    const visible = parentVisible && !child.hidden;
    const isGroup =
      Array.isArray(child.children) && (child.children?.length ?? 0) > 0;

    if (!isGroup) {
      let layerCanvas: HTMLCanvasElement | null = null;

      // Prefer raw ImageData (useImageData: true) — no premultiplied-alpha issues
      if (child.imageData && child.imageData.width > 0 && child.imageData.height > 0) {
        layerCanvas = imageDataToCanvas(child.imageData);
      } else if (child.canvas && child.canvas.width > 0 && child.canvas.height > 0) {
        // Fallback: normalise the ag-psd canvas via a clean copy
        layerCanvas = cloneCanvas(child.canvas);
      }

      if (!layerCanvas) continue;

      const w = layerCanvas.width;
      const h = layerCanvas.height;
      const id = `layer_${++layerCounter}_${Date.now()}`;

      // Store full-res canvas OUTSIDE of React state
      storeLayerCanvas(id, layerCanvas);

      // Only store a tiny thumbnail in state (a few KB at most)
      const thumbnail = makeThumbnail(layerCanvas);

      const layer: PsdLayer = {
        id,
        name: child.name ?? `Camada ${layerCounter}`,
        visible,
        x: child.left ?? 0,
        y: child.top ?? 0,
        width: w,
        height: h,
        opacity: (child.opacity ?? 255) / 255,
        thumbnail,
        isGroup: false,
        order: result.length,
        blendMode: child.blendMode,
        animation: { ...DEFAULT_ANIMATION },
      };
      result.push(layer);
    } else if (isGroup && child.children) {
      result.push(...flattenLayers(child.children, visible));
    }
  }
  return result;
}

interface Props {
  onDocumentLoaded: (doc: PsdDocument) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}

export default function PsdUploader({
  onDocumentLoaded,
  isLoading,
  setIsLoading,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".psd")) {
        setError("Por favor, selecione um arquivo .PSD do Photoshop.");
        return;
      }
      setError(null);
      setIsLoading(true);
      setProgress("Lendo arquivo PSD...");

      try {
        const buffer = await file.arrayBuffer();
        setProgress("Decodificando camadas...");

        // Limpa pixels do PSD anterior da memória
        clearLayerPixelStore();

        // Importação dinâmica do ag-psd (evita SSR issues)
        const { readPsd } = await import("ag-psd");

        // Sempre usamos useImageData: false para garantir que ag-psd processe
        // todas as camadas (incluindo texto e formas vetoriais) como canvas.
        const psd = readPsd(buffer, {
          useImageData: false,
        }) as PsdReadResult;

        // Detecta modo de cor não-RGB
        if (psd.colorMode !== undefined && psd.colorMode !== 3) {
          const modeNames: Record<number, string> = {
            0: "Bitmap", 1: "Tons de Cinza", 2: "Indexado",
            4: "CMYK", 7: "Multichannel", 8: "Duotone", 9: "Lab",
          };
          const modeName = modeNames[psd.colorMode] ?? `Modo ${psd.colorMode}`;
          setError(
            `⚠️ Seu PSD está em modo ${modeName}. As cores podem sair erradas. ` +
            `Para resultado perfeito: Photoshop → Imagem → Modo → Cores RGB (8 bits/canal), depois salve novamente.`
          );
        }

        setProgress("Extraindo imagens das camadas...");
        const rawLayers = flattenLayers(psd.children ?? []);

        // Reverte para ordem visual correta (topo = último = renderizado por cima)
        const layers = rawLayers.reverse().map((l, i) => ({ ...l, order: i }));

        if (layers.length === 0) {
          setError(
            "Nenhuma camada com conteúdo encontrada. " +
            "Certifique-se de salvar como .PSD (não .PSB) com camadas visíveis e não apenas grupos vazios."
          );
          setIsLoading(false);
          return;
        }

        setProgress(`${layers.length} camadas encontradas!`);
        console.log(
          `[PsdUploader] ${layers.length} camadas carregadas.`,
          layers.map((l) => `${l.name} (${l.width}×${l.height} em ${l.x},${l.y})`)
        );

        const doc: PsdDocument = {
          width: psd.width,
          height: psd.height,
          layers,
          fileName: file.name,
          aspectRatio: psd.width / psd.height,
        };

        setTimeout(() => {
          setIsLoading(false);
          setProgress("");
          onDocumentLoaded(doc);
        }, 400);
      } catch (err) {
        console.error("Erro ao ler PSD:", err);
        setError(
          "Erro ao ler o PSD. Certifique-se de que o arquivo foi salvo em formato compatível (RGB, 8-bit por canal). Evite PSB ou CMYK."
        );
        setIsLoading(false);
        setProgress("");
      }
    },
    [onDocumentLoaded, setIsLoading]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="uploader-wrapper">
      <div
        className={`uploader-zone ${isDragging ? "dragging" : ""} ${isLoading ? "loading" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          e.key === "Enter" && !isLoading && inputRef.current?.click()
        }
        aria-label="Área de upload do arquivo PSD"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".psd"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="psd-file-input"
        />

        {isLoading ? (
          <div className="uploader-loading">
            <div className="uploader-spinner" />
            <p className="uploader-progress">{progress}</p>
          </div>
        ) : (
          <div className="uploader-content">
            <div className="uploader-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="8"
                  width="40"
                  height="48"
                  rx="4"
                  fill="url(#psGrad)"
                  opacity="0.15"
                />
                <rect
                  x="4"
                  y="8"
                  width="40"
                  height="48"
                  rx="4"
                  stroke="url(#psGrad)"
                  strokeWidth="2"
                />
                <path
                  d="M28 8V20H40"
                  stroke="url(#psGrad)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <text
                  x="12"
                  y="42"
                  fill="url(#psGrad)"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  PSD
                </text>
                <circle cx="48" cy="48" r="14" fill="url(#uploadGrad)" />
                <path
                  d="M48 54V42M44 46L48 42L52 46"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient
                    id="psGrad"
                    x1="0"
                    y1="0"
                    x2="40"
                    y2="56"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#a78bfa" />
                    <stop offset="1" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient
                    id="uploadGrad"
                    x1="34"
                    y1="34"
                    x2="62"
                    y2="62"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#7c3aed" />
                    <stop offset="1" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className="uploader-title">
              {isDragging
                ? "Solte o arquivo aqui"
                : "Arraste seu arquivo PSD"}
            </h2>
            <p className="uploader-sub">
              ou{" "}
              <span className="uploader-link">clique para selecionar</span>
            </p>
            <div className="uploader-hints">
              <span className="hint-tag">✓ Salve com camadas separadas</span>
              <span className="hint-tag">✓ Modo RGB 8-bit</span>
              <span className="hint-tag">✓ Formato .PSD (não PSB)</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="uploader-error" role="alert">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="uploader-tip">
        <strong>💡 Dica Photoshop:</strong> Arquivo → Exportar → Salvar Cópia...
        → selecione <em>.PSD</em> com todas as camadas visíveis nomeadas.
      </div>
    </div>
  );
}
