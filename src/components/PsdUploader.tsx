"use client";

import { useCallback, useRef, useState } from "react";
import type { PsdDocument, PsdLayer } from "@/types/psd";
import { DEFAULT_ANIMATION } from "@/types/psd";

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
  blendMode?: string;
  children?: PsdChild[];
}

let layerCounter = 0;

/**
 * Converts any canvas (including CMYK-corrupted) to a clean RGBA PNG data URL.
 * The secret: draw into a NEW canvas via drawImage() — the browser normalises
 * premultiplied alpha and CMYK channel mis-ordering in one step.
 */
function canvasToCleanPng(src: HTMLCanvasElement): string {
  const clean = document.createElement("canvas");
  clean.width = src.width;
  clean.height = src.height;
  const ctx = clean.getContext("2d");
  if (!ctx) return src.toDataURL("image/png");
  // clearRect ensures a transparent background before compositing
  ctx.clearRect(0, 0, clean.width, clean.height);
  ctx.drawImage(src, 0, 0);
  return clean.toDataURL("image/png");
}

function flattenLayers(children: PsdChild[], parentVisible = true): PsdLayer[] {
  const result: PsdLayer[] = [];
  for (const child of children) {
    const visible = parentVisible && !child.hidden;
    const isGroup = Array.isArray(child.children) && (child.children?.length ?? 0) > 0;

    if (!isGroup && child.canvas) {
      const canvas = child.canvas;
      const w = canvas.width;
      const h = canvas.height;

      if (w === 0 || h === 0) continue;

      // Gera PNG via canvas limpo (corrige CMYK e premultiplied alpha)
      const imageData = canvasToCleanPng(canvas);

      // Gera thumbnail pequeno (max 120px) também via canvas limpo
      const thumbSize = 120;
      const scale = Math.min(thumbSize / w, thumbSize / h, 1);
      const tw = Math.round(w * scale);
      const th = Math.round(h * scale);
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = tw;
      thumbCanvas.height = th;
      const tctx = thumbCanvas.getContext("2d");
      if (tctx) {
        tctx.clearRect(0, 0, tw, th);
        tctx.drawImage(canvas, 0, 0, tw, th);
      }
      const thumbnail = thumbCanvas.toDataURL("image/png");

      const layer: PsdLayer = {
        id: `layer_${++layerCounter}_${Date.now()}`,
        name: child.name ?? `Camada ${layerCounter}`,
        visible,
        x: child.left ?? 0,
        y: child.top ?? 0,
        width: w,
        height: h,
        opacity: (child.opacity ?? 255) / 255,
        imageData,
        thumbnail,
        isGroup: false,
        order: result.length,
        blendMode: child.blendMode,
        animation: { ...DEFAULT_ANIMATION },
        // NOTE: NÃO guardamos child.canvas no state — objetos DOM não devem
        // ficar no state do React pois são mutáveis e se perdem após re-renders.
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

export default function PsdUploader({ onDocumentLoaded, isLoading, setIsLoading }: Props) {
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

        // Importação dinâmica do ag-psd (evita SSR issues)
        const { readPsd } = await import("ag-psd");

        // useImageData: false → ag-psd usa canvas (necessário para extrair pixels)
        const psd = readPsd(buffer, { useImageData: false }) as PsdReadResult;

        // Detecta modo de cor não-RGB (CMYK = 4, LAB = 9, etc.)
        // ag-psd ainda renderiza em canvas mas as cores podem sair erradas em CMYK
        const isCmyk = psd.colorMode === 4;
        if (isCmyk) {
          setError(
            "⚠️ Seu PSD está em modo CMYK. As cores podem aparecer distorcidas. " +
            "Para resultado perfeito: Photoshop → Imagem → Modo → Cores RGB, depois salve e tente novamente."
          );
          // Continuamos mesmo assim — melhor ter cores levemente erradas do que não funcionar
        }

        setProgress("Extraindo imagens das camadas...");
        const rawLayers = flattenLayers(psd.children ?? []);
        // Reverte para ordem visual correta (topo da pilha = último = renderizado por cima)
        const layers = rawLayers.reverse().map((l, i) => ({ ...l, order: i }));

        if (layers.length === 0) {
          setError(
            "Nenhuma camada com conteúdo encontrada. Certifique-se de salvar como .PSD (não .PSB) com camadas visíveis."
          );
          setIsLoading(false);
          return;
        }

        setProgress(`${layers.length} camadas encontradas!`);

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
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && !isLoading && inputRef.current?.click()}
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
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="8" width="40" height="48" rx="4" fill="url(#psGrad)" opacity="0.15"/>
                <rect x="4" y="8" width="40" height="48" rx="4" stroke="url(#psGrad)" strokeWidth="2"/>
                <path d="M28 8V20H40" stroke="url(#psGrad)" strokeWidth="2" strokeLinejoin="round"/>
                <text x="12" y="42" fill="url(#psGrad)" fontSize="14" fontWeight="bold" fontFamily="sans-serif">PSD</text>
                <circle cx="48" cy="48" r="14" fill="url(#uploadGrad)"/>
                <path d="M48 54V42M44 46L48 42L52 46" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="psGrad" x1="0" y1="0" x2="40" y2="56" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a78bfa"/>
                    <stop offset="1" stopColor="#60a5fa"/>
                  </linearGradient>
                  <linearGradient id="uploadGrad" x1="34" y1="34" x2="62" y2="62" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7c3aed"/>
                    <stop offset="1" stopColor="#3b82f6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className="uploader-title">
              {isDragging ? "Solte o arquivo aqui" : "Arraste seu arquivo PSD"}
            </h2>
            <p className="uploader-sub">
              ou <span className="uploader-link">clique para selecionar</span>
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
        <strong>💡 Dica Photoshop:</strong> Arquivo → Exportar → Salvar Cópia... → selecione <em>.PSD</em> com todas as camadas visíveis nomeadas.
      </div>
    </div>
  );
}
