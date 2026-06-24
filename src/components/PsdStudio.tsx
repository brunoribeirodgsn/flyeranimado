"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PsdDocument, PsdLayer } from "@/types/psd";
import type { GeminiAnalysisResponse } from "@/types/psd";
import PsdUploader from "./PsdUploader";
import LayerPanel from "./LayerPanel";
import AnimationPreview from "./AnimationPreview";
import type { AnimationPreviewHandle } from "./AnimationPreview";
import ExportPanel from "./ExportPanel";

type Step = "upload" | "editor";

export default function PsdStudio() {
  const [step, setStep] = useState<Step>("upload");
  const [psdDoc, setPsdDoc] = useState<PsdDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(8);
  const [aiStyle, setAiStyle] = useState<string | undefined>();
  const previewRef = useRef<AnimationPreviewHandle | null>(null);

  // Check if API key is configured (we do a lightweight check via a param)
  // The actual check happens server-side; we assume it's configured unless told otherwise
  const [hasApiKey, setHasApiKey] = useState(true);

  // For debugging / development layout
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("mock=true")) {
      setPsdDoc({
        width: 1080,
        height: 1920,
        fileName: "flyer_evento_mock.psd",
        aspectRatio: 1080 / 1920,
        layers: [
          {
            id: "bg",
            name: "Background",
            visible: true,
            x: 0,
            y: 0,
            width: 1080,
            height: 1920,
            opacity: 1,
            imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88eLFfwAJtQOxz615pAAAAABJRU5ErkJggg==",
            thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88eLFfwAJtQOxz615pAAAAABJRU5ErkJggg==",
            isGroup: false,
            order: 0,
            animation: { type: "fade-in", delay: 0, duration: 1500, easing: "ease-out", hold: true }
          },
          {
            id: "title",
            name: "Título Principal",
            visible: true,
            x: 100,
            y: 400,
            width: 880,
            height: 200,
            opacity: 1,
            imageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
            isGroup: false,
            order: 1,
            animation: { type: "slide-up", delay: 500, duration: 800, easing: "spring", hold: true }
          }
        ]
      });
      setStep("editor");
    }
  }, []);

  const handleDocumentLoaded = useCallback((doc: PsdDocument) => {
    setPsdDoc(doc);
    setStep("editor");
    setIsPlaying(true);
  }, []);

  const handleLayersChange = useCallback(
    (layers: PsdLayer[]) => {
      if (!psdDoc) return;
      setPsdDoc({ ...psdDoc, layers });
    },
    [psdDoc]
  );

  const handleSuggestWithAI = useCallback(async () => {
    if (!psdDoc || isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/analyze-layers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layers: psdDoc.layers.map((l) => ({
            id: l.id,
            name: l.name,
            width: l.width,
            height: l.height,
            x: l.x,
            y: l.y,
            opacity: l.opacity,
            order: l.order,
          })),
          documentWidth: psdDoc.width,
          documentHeight: psdDoc.height,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error?.includes("GEMINI_API_KEY")) {
          setHasApiKey(false);
        }
        console.error("AI analysis failed:", err.error);
        return;
      }

      const data: GeminiAnalysisResponse = await res.json();
      setAiStyle(data.overallStyle);

      // Apply suggestions to layers
      const updatedLayers = psdDoc.layers.map((layer) => {
        const suggestion = data.suggestions.find((s) => s.layerId === layer.id);
        if (suggestion) {
          return { ...layer, animation: suggestion.animation };
        }
        return layer;
      });

      setPsdDoc({ ...psdDoc, layers: updatedLayers });
    } catch (err) {
      console.error("Error calling AI:", err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [psdDoc, isAnalyzing]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setPsdDoc(null);
    setAiStyle(undefined);
    setIsPlaying(false);
  }, []);

  return (
    <div className="studio-root">
      {step === "upload" && (
        <div className="studio-upload-page">
          <div className="studio-hero">
            <div className="studio-logo">
              <span className="logo-ps">PS</span>
              <span className="logo-arrow">→</span>
              <span className="logo-anim">✨</span>
            </div>
            <h1 className="studio-hero-title">PSD Animator</h1>
            <p className="studio-hero-sub">
              Importe seu arte do Photoshop, e a IA anima cada camada automaticamente.<br />
              Exporte como vídeo MP4 pronto para redes sociais.
            </p>
            <div className="studio-features">
              <div className="feature-chip">🤖 IA Gemini analisa camadas</div>
              <div className="feature-chip">🎞️ Export MP4 no browser</div>
              <div className="feature-chip">🎨 Story · Feed · Landscape</div>
              <div className="feature-chip">⚡ 100% gratuito</div>
            </div>
          </div>
          <PsdUploader
            onDocumentLoaded={handleDocumentLoaded}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      )}

      {step === "editor" && psdDoc && (
        <div className="studio-editor">
          {/* Top bar */}
          <div className="editor-topbar">
            <div className="editor-topbar-left">
              <button className="back-btn" onClick={handleReset} aria-label="Voltar ao início">
                ← Novo PSD
              </button>
              <span className="editor-filename">{psdDoc.fileName}</span>
              <span className="editor-dims">
                {psdDoc.width}×{psdDoc.height}
              </span>
            </div>
            <div className="editor-topbar-center">
              <span className="studio-name">PSD Animator</span>
            </div>
            <div className="editor-topbar-right">
              <span className="layer-badge">{psdDoc.layers.length} camadas</span>
            </div>
          </div>

          {/* Main layout */}
          <div className="editor-layout">
            {/* Left: Layer Panel */}
            <aside className="editor-sidebar" aria-label="Painel de camadas">
              <LayerPanel
                document={psdDoc}
                onLayersChange={handleLayersChange}
                onSuggestWithAI={handleSuggestWithAI}
                isAnalyzing={isAnalyzing}
                aiStyle={aiStyle}
                hasApiKey={hasApiKey}
              />
            </aside>

            {/* Center: Preview */}
            <main className="editor-main" aria-label="Preview da animação">
              <AnimationPreview
                ref={previewRef}
                document={psdDoc}
                duration={duration}
                isPlaying={isPlaying}
                onPlayChange={setIsPlaying}
              />
            </main>

            {/* Right: Export */}
            <aside className="editor-export" aria-label="Painel de exportação">
              <ExportPanel
                document={psdDoc}
                previewRef={previewRef}
                duration={duration}
                onDurationChange={setDuration}
                onPlayChange={setIsPlaying}
              />
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
