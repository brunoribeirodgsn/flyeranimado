// Shared animation rendering logic for the export canvas
// This is a plain module (no React) so it can be dynamically imported

import type { PsdLayer, EasingType, AnimationType } from "@/types/psd";

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

export function renderExportFrame(
  ctx: CanvasRenderingContext2D,
  layer: PsdLayer,
  img: HTMLImageElement,
  elapsed: number,
  totalMs: number,
  scaleX: number,
  scaleY: number
) {
  const { animation: anim } = layer;
  const start = anim.delay;
  const end = anim.delay + anim.duration;

  let t = elapsed < start ? 0 : elapsed > end ? 1 : (elapsed - start) / anim.duration;

  if (anim.loop && anim.type === "scale-pulse") {
    const loopT = ((elapsed - start) % (anim.duration * 2)) / anim.duration;
    t = loopT < 1 ? loopT : 2 - loopT;
  }

  const eased = easingFn(anim.easing, Math.min(t, 1));
  const x = layer.x * scaleX;
  const y = layer.y * scaleY;
  const w = layer.width * scaleX;
  const h = layer.height * scaleY;
  const { opacity } = layer;

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
      const offset = (1 - eased) * Math.min(h * 0.6, 200 * scaleY);
      ctx.globalAlpha = opacity * eased;
      ctx.drawImage(img, x, y + offset, w, h);
      break;
    }
    case "slide-down": {
      const offset = (1 - eased) * Math.min(h * 0.6, 200 * scaleY);
      ctx.globalAlpha = opacity * eased;
      ctx.drawImage(img, x, y - offset, w, h);
      break;
    }
    case "slide-left": {
      const offset = (1 - eased) * Math.min(w * 0.4, 300 * scaleX);
      ctx.globalAlpha = opacity * eased;
      ctx.drawImage(img, x + offset, y, w, h);
      break;
    }
    case "slide-right": {
      const offset = (1 - eased) * Math.min(w * 0.4, 300 * scaleX);
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
      const cx = x + w / 2, cy = y + h / 2;
      ctx.globalAlpha = opacity * Math.min(eased * 3, 1);
      ctx.translate(cx, cy);
      ctx.scale(bEased, bEased);
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
