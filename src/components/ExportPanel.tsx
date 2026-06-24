"use client";

import { useCallback, useRef, useState } from "react";
import type { PsdDocument, OutputFormat, OutputQuality } from "@/types/psd";
import { FORMAT_DIMENSIONS } from "@/types/psd";
import type { AnimationPreviewHandle } from "./AnimationPreview";

interface Props {
  document: PsdDocument;
  previewRef: React.RefObject<AnimationPreviewHandle | null>;
  duration: number;
  onDurationChange: (v: number) => void;
  onPlayChange: (v: boolean) => void;
}

type ExportStatus = "idle" | "preparing" | "recording" | "encoding" | "done" | "error";

export default function ExportPanel({
  document: doc,
  previewRef,
  duration,
  onDurationChange,
  onPlayChange,
}: Props) {
  const [format, setFormat] = useState<OutputFormat>("story");
  const [quality, setQuality] = useState<OutputQuality>("1080p");
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleExport = useCallback(async () => {
    const handle = previewRef.current;
    const previewCanvas = handle?.getCanvas();
    if (!previewCanvas) {
      setErrorMsg("Canvas de preview não disponível.");
      setStatus("error");
      return;
    }

    setStatus("preparing");
    setProgress(0);
    setErrorMsg("");

    // Stop current playback during export
    onPlayChange(false);

    try {
      // ── 1. Create offscreen export canvas ────────────────────────────────
      const dims = FORMAT_DIMENSIONS[format];
      const qualityScale = quality === "1080p" ? 1 : 720 / 1080;
      const exportW = Math.round(dims.w * qualityScale);
      const exportH = Math.round(dims.h * qualityScale);

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = exportW;
      exportCanvas.height = exportH;
      const ctx = exportCanvas.getContext("2d")!;

      // ── 2. Pre-load images (only those that DO NOT have in-memory canvas objects) ──
      const imageMap = new Map<string, HTMLImageElement>();
      const layersToLoad = doc.layers.filter((l) => !l.canvas && l.imageData);
      await Promise.all(
        layersToLoad.map(
          (layer) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => {
                imageMap.set(layer.id, img);
                resolve();
              };
              img.onerror = (e) => {
                console.error(`Error loading image for layer ${layer.name} during export:`, e);
                resolve();
              };
              img.src = layer.imageData;
            })
        )
      );

      // ── 3. Setup MediaRecorder ────────────────────────────────────────────
      const fps = 30;
      const stream = exportCanvas.captureStream(fps);
      const totalMs = duration * 1000;

      // Try MP4 first, fallback to WebM
      const mp4Mime = "video/mp4;codecs=avc1.424028,mp4a.40.2";
      const webmMime = "video/webm;codecs=vp9";
      const mimeType = MediaRecorder.isTypeSupported(mp4Mime) ? mp4Mime : webmMime;
      const ext = mimeType.startsWith("video/mp4") ? "mp4" : "webm";

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        setStatus("encoding");
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const baseName = doc.fileName.replace(/\.psd$/i, "");
        a.download = `${baseName}_animado.${ext}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        setStatus("done");
        setProgress(100);
      };

      // ── 4. Render frames using requestAnimationFrame-like approach ────────

      // Import animation renderer functions
      const { renderExportFrame } = await import("./exportRenderer");

      setStatus("recording");
      recorder.start(100);

      const startTime = performance.now();
      let lastProgress = 0;

      function renderLoop() {
        const elapsed = performance.now() - startTime;
        const prog = Math.min(elapsed / totalMs, 1);

        if (prog !== lastProgress) {
          lastProgress = prog;
          setProgress(Math.round(prog * 95));
        }

        // Clear
        ctx.clearRect(0, 0, exportW, exportH);

        // Scale from doc dimensions to export dimensions
        const scaleX = exportW / doc.width;
        const scaleY = exportH / doc.height;

        // Render each layer
        const sorted = [...doc.layers].sort((a, b) => a.order - b.order);
        for (const layer of sorted) {
          if (!layer.visible) continue;
          const source = layer.canvas || imageMap.get(layer.id);
          if (!source) continue;
          renderExportFrame(ctx, layer, source, elapsed % totalMs, totalMs, scaleX, scaleY);
        }

        if (prog < 1) {
          requestAnimationFrame(renderLoop);
        } else {
          recorder.stop();
        }
      }

      requestAnimationFrame(renderLoop);
    } catch (err) {
      console.error("Export error:", err);
      setErrorMsg("Erro ao exportar. Verifique se seu browser suporta MediaRecorder.");
      setStatus("error");
    }
  }, [doc, format, quality, duration, previewRef, onPlayChange]);

  const statusLabel: Record<ExportStatus, string> = {
    idle: "",
    preparing: "Preparando canvas de exportação...",
    recording: `Gravando vídeo... ${progress}%`,
    encoding: "Finalizando arquivo...",
    done: "✅ Vídeo exportado com sucesso!",
    error: `❌ ${errorMsg}`,
  };

  return (
    <div className="export-panel">
      <h3 className="export-title">🎬 Exportar Vídeo</h3>

      {/* Duration */}
      <div className="export-section">
        <label className="export-label">
          Duração total <span className="export-value">{duration}s</span>
        </label>
        <input
          type="range"
          min="3"
          max="30"
          step="1"
          value={duration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          className="ctrl-slider"
          id="duration-slider"
          aria-label="Duração total do vídeo"
        />
        <div className="export-range-labels">
          <span>3s</span><span>30s</span>
        </div>
      </div>

      {/* Format */}
      <div className="export-section">
        <label className="export-label">Formato</label>
        <div className="format-grid">
          {(Object.entries(FORMAT_DIMENSIONS) as [OutputFormat, { w: number; h: number; label: string }][]).map(
            ([key, val]) => (
              <button
                key={key}
                id={`format-${key}`}
                className={`format-btn ${format === key ? "active" : ""}`}
                onClick={() => setFormat(key)}
                aria-pressed={format === key}
                aria-label={val.label}
              >
                <span className="format-icon">
                  {key === "story" ? "📱" : key === "feed" ? "⬛" : "🖥"}
                </span>
                <span className="format-label">{val.label}</span>
                <span className="format-size">
                  {val.w}×{val.h}
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Quality */}
      <div className="export-section">
        <label className="export-label">Qualidade</label>
        <div className="quality-row">
          {(["720p", "1080p"] as OutputQuality[]).map((q) => (
            <button
              key={q}
              id={`quality-${q}`}
              className={`quality-btn ${quality === q ? "active" : ""}`}
              onClick={() => setQuality(q)}
              aria-pressed={quality === q}
            >
              {q}
              {q === "1080p" && <span className="quality-badge">HD</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Export button */}
      <button
        id="export-btn"
        className={`export-btn ${status === "recording" || status === "preparing" ? "exporting" : ""}`}
        onClick={handleExport}
        disabled={status === "recording" || status === "preparing" || status === "encoding"}
        aria-label="Exportar vídeo MP4"
      >
        {status === "recording" || status === "preparing" || status === "encoding" ? (
          <>
            <div className="export-btn-spinner" />
            {status === "recording" ? `Gravando ${progress}%` : "Processando..."}
          </>
        ) : (
          <>
            <span>⬇</span>
            Exportar{" "}
            {format === "story" ? "Story" : format === "feed" ? "Feed" : "Landscape"} ·{" "}
            {FORMAT_DIMENSIONS[format].w}×{FORMAT_DIMENSIONS[format].h}
          </>
        )}
      </button>

      {/* Progress bar */}
      {(status === "recording" || status === "preparing") && (
        <div className="export-progress-bar">
          <div className="export-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Status message */}
      {status !== "idle" && (
        <p className={`export-status ${status}`}>{statusLabel[status]}</p>
      )}

      <p className="export-note">
        🌐 Chrome/Edge: MP4 · Firefox: WebM · Safari: WebM<br />
        O vídeo é gerado 100% no seu browser, sem envio de dados.
      </p>
    </div>
  );
}
