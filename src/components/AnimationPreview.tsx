"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import type { PsdDocument, PsdLayer, AnimationType, EasingType } from "@/types/psd";
import { getLayerCanvas } from "@/lib/layerPixelStore";

// ─── Easing functions ────────────────────────────────────────────────────────

function easingFn(type: EasingType, t: number): number {
  switch (type) {
    case "linear":      return t;
    case "ease-in":     return t * t * t;
    case "ease-out":    return 1 - Math.pow(1 - t, 3);
    case "ease-in-out": return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    case "bounce": {
      const n1 = 7.5625, d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
    case "spring": {
      const c4 = (2 * Math.PI) / 3;
      if (t === 0) return 0;
      if (t === 1) return 1;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
    default: return t;
  }
}

// ─── Animation renderer ───────────────────────────────────────────────────────

function applyAnimation(
  ctx: CanvasRenderingContext2D,
  layer: PsdLayer,
  img: HTMLCanvasElement,
  elapsed: number,
  totalMs: number
) {
  const { animation: anim } = layer;
  const start = anim.delay;
  const end = anim.delay + anim.duration;

  // Raw progress 0–1 within the animation window
  let t = elapsed < start ? 0 : elapsed > end ? 1 : (elapsed - start) / anim.duration;

  // Loop support
  if (anim.loop && anim.type === "scale-pulse") {
    const loopT = ((elapsed - start) % (anim.duration * 2)) / anim.duration;
    t = loopT < 1 ? loopT : 2 - loopT;
  }

  const eased = easingFn(anim.easing, Math.min(t, 1));
  const { x, y, width: w, height: h, opacity } = layer;

  ctx.save();
  ctx.globalAlpha = opacity;

  const animType: AnimationType = anim.type;

  switch (animType) {
    case "none":
      ctx.drawImage(img, x, y, w, h);
      break;

    case "fade-in":
      ctx.globalAlpha = opacity * eased;
      ctx.drawImage(img, x, y, w, h);
      break;

    case "fade-out":
      ctx.globalAlpha = opacity * (1 - eased);
      ctx.drawImage(img, x, y, w, h);
      break;

    case "slide-up": {
      const offset = (1 - eased) * Math.min(h * 0.6, 200);
      ctx.globalAlpha = opacity * eased;
      ctx.drawImage(img, x, y + offset, w, h);
      break;
    }

    case "slide-down": {
      const offset = (1 - eased) * Math.min(h * 0.6, 200);
      ctx.globalAlpha = opacity * eased;
      ctx.drawImage(img, x, y - offset, w, h);
      break;
    }

    case "slide-left": {
      const offset = (1 - eased) * Math.min(w * 0.4, 300);
      ctx.globalAlpha = opacity * eased;
      ctx.drawImage(img, x + offset, y, w, h);
      break;
    }

    case "slide-right": {
      const offset = (1 - eased) * Math.min(w * 0.4, 300);
      ctx.globalAlpha = opacity * eased;
      ctx.drawImage(img, x - offset, y, w, h);
      break;
    }

    case "zoom-in": {
      const scale = 0.3 + eased * 0.7;
      const cx = x + w / 2, cy = y + h / 2;
      ctx.globalAlpha = opacity * eased;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      break;
    }

    case "zoom-out": {
      const scale = 1.5 - eased * 0.5;
      const cx = x + w / 2, cy = y + h / 2;
      ctx.globalAlpha = opacity * eased;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      break;
    }

    case "bounce-in": {
      const bEased = easingFn("bounce", eased);
      const scale = bEased;
      const cx = x + w / 2, cy = y + h / 2;
      ctx.globalAlpha = opacity * Math.min(eased * 3, 1);
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      break;
    }

    case "rotate-in": {
      const angle = (1 - eased) * Math.PI * 0.3;
      const cx = x + w / 2, cy = y + h / 2;
      ctx.globalAlpha = opacity * eased;
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.scale(eased, eased);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      break;
    }

    case "blur-in": {
      // Canvas blur via filter (Chrome/Edge support)
      const blurPx = (1 - eased) * 20;
      ctx.globalAlpha = opacity * eased;
      if ("filter" in ctx) {
        (ctx as CanvasRenderingContext2D & { filter: string }).filter =
          blurPx > 0.5 ? `blur(${blurPx.toFixed(1)}px)` : "none";
      }
      ctx.drawImage(img, x, y, w, h);
      if ("filter" in ctx) {
        (ctx as CanvasRenderingContext2D & { filter: string }).filter = "none";
      }
      break;
    }

    case "scale-pulse": {
      const pulse = 1 + Math.sin(eased * Math.PI * 2) * 0.05;
      const cx = x + w / 2, cy = y + h / 2;
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      break;
    }

    default:
      ctx.drawImage(img, x, y, w, h);
  }

  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface AnimationPreviewHandle {
  getCanvas: () => HTMLCanvasElement | null;
  getDuration: () => number;
}

interface Props {
  document: PsdDocument;
  duration: number;    // segundos
  isPlaying: boolean;
  onPlayChange: (v: boolean) => void;
}

const AnimationPreview = forwardRef<AnimationPreviewHandle, Props>(
  function AnimationPreview({ document: doc, duration, isPlaying, onPlayChange }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const pausedAtRef = useRef<number>(0);
    const [currentTime, setCurrentTime] = useState(0);
    const totalMs = duration * 1000;

    // Expose canvas for export
    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
      getDuration: () => duration,
    }));

    // No async image loading needed — pixel data lives in layerPixelStore (HTMLCanvasElement).
    // We mark ready immediately and re-render when doc changes.

    // Render a single frame — reads canvases directly from layerPixelStore
    const renderFrame = useCallback(
      (elapsed: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw layers bottom→top (order 0 = bottom)
        const sorted = [...doc.layers].sort((a, b) => a.order - b.order);
        for (const layer of sorted) {
          if (!layer.visible) continue;
          const src = getLayerCanvas(layer.id);
          if (!src) {
            console.warn(`[Preview] no canvas for layer "${layer.name}" (${layer.id})`);
            continue;
          }
          applyAnimation(ctx, layer, src, elapsed, totalMs);
        }
      },
      [doc, totalMs]
    );

    // Animation loop
    useEffect(() => {
      if (!isPlaying) {
        cancelAnimationFrame(rafRef.current);
        renderFrame(pausedAtRef.current);
        return;
      }

      const offset = pausedAtRef.current;
      startTimeRef.current = performance.now() - offset;

      const loop = (now: number) => {
        const elapsed = (now - startTimeRef.current) % totalMs;
        pausedAtRef.current = elapsed;
        setCurrentTime(elapsed / 1000);
        renderFrame(elapsed);
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(rafRef.current);
    }, [isPlaying, renderFrame, totalMs]);

    // Initial render / when doc changes
    useEffect(() => {
      renderFrame(0);
      pausedAtRef.current = 0;
      setCurrentTime(0);
    }, [doc, renderFrame]);

    // Canvas dimensions: fit inside container while keeping aspect ratio
    const maxW = 640;
    const progress = (currentTime / duration) * 100;

    return (
      <div className="preview-wrapper">
        {/* Canvas */}
        <div
          className="preview-canvas-wrap"
          style={{
            aspectRatio: `${doc.width}/${doc.height}`,
            width: "100%",
            maxWidth: Math.min(doc.width, maxW),
          }}
        >
          <canvas
            ref={canvasRef}
            width={doc.width}
            height={doc.height}
            style={{ width: "100%", height: "100%", display: "block" }}
            className="preview-canvas"
            aria-label="Preview da animação do flyer"
          />
        </div>

        {/* Controls */}
        <div className="preview-controls">
          <button
            id="play-pause-btn"
            className="play-btn"
            onClick={() => onPlayChange(!isPlaying)}
            aria-label={isPlaying ? "Pausar" : "Play"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <div className="preview-progress-wrap">
            <div className="preview-progress-bar">
              <div className="preview-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="preview-time">
              {currentTime.toFixed(1)}s / {duration}s
            </div>
          </div>

          <button
            className="restart-btn"
            onClick={() => {
              pausedAtRef.current = 0;
              setCurrentTime(0);
              renderFrame(0);
            }}
            aria-label="Reiniciar animação"
          >
            ↺
          </button>
        </div>

        <div className="preview-info">
          {doc.width}×{doc.height}px · {doc.layers.filter((l) => l.visible).length} camadas visíveis
        </div>
      </div>
    );
  }
);

export default AnimationPreview;
