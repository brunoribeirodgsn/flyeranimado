// ─── Animation Types ────────────────────────────────────────────────────────

export type AnimationType =
  | "none"
  | "fade-in"
  | "fade-out"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "zoom-out"
  | "bounce-in"
  | "rotate-in"
  | "blur-in"
  | "scale-pulse";

export type EasingType =
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "bounce"
  | "spring";

export interface AnimationConfig {
  type: AnimationType;
  delay: number;      // ms — quando começa após o início do vídeo
  duration: number;   // ms — quanto tempo dura a entrada
  easing: EasingType;
  loop?: boolean;     // anima em loop?
  hold?: boolean;     // mantém visível até o fim?
}

// ─── PSD Layer ───────────────────────────────────────────────────────────────

export interface PsdLayer {
  id: string;
  name: string;
  visible: boolean;
  x: number;           // posição X no canvas
  y: number;           // posição Y no canvas
  width: number;
  height: number;
  opacity: number;     // 0–1
  imageData: string;   // base64 PNG da camada
  isGroup: boolean;
  order: number;       // índice (0 = mais abaixo)
  blendMode?: string;
  animation: AnimationConfig;
  // thumbnail gerado pelo sistema
  thumbnail?: string;  // base64 PNG reduzido
}

// ─── PSD Document ────────────────────────────────────────────────────────────

export interface PsdDocument {
  width: number;
  height: number;
  layers: PsdLayer[];
  fileName: string;
  aspectRatio: number;
}

// ─── Export Settings ─────────────────────────────────────────────────────────

export type OutputFormat = "story" | "feed" | "landscape";
export type OutputQuality = "720p" | "1080p";

export interface ExportSettings {
  format: OutputFormat;
  quality: OutputQuality;
  duration: number;   // segundos
  fps: number;        // frames por segundo
  withAudio: boolean;
}

export const FORMAT_DIMENSIONS: Record<OutputFormat, { w: number; h: number; label: string }> = {
  story:     { w: 1080, h: 1920, label: "Story / Reels (9:16)" },
  feed:      { w: 1080, h: 1080, label: "Feed Post (1:1)" },
  landscape: { w: 1920, h: 1080, label: "Landscape (16:9)" },
};

// ─── AI Suggestion ───────────────────────────────────────────────────────────

export interface LayerSuggestion {
  layerId: string;
  layerName: string;
  animation: AnimationConfig;
  reasoning: string;  // por que a IA escolheu essa animação
}

export interface GeminiAnalysisResponse {
  suggestions: LayerSuggestion[];
  overallStyle: string;  // descrição do estilo geral sugerido
}

// ─── Animation Presets ───────────────────────────────────────────────────────

export const ANIMATION_PRESETS: Record<AnimationType, { label: string; icon: string; description: string }> = {
  none:        { label: "Sem animação",    icon: "⊘",  description: "A camada aparece estática" },
  "fade-in":   { label: "Fade In",         icon: "✨",  description: "Aparece gradualmente" },
  "fade-out":  { label: "Fade Out",        icon: "👻",  description: "Desaparece gradualmente" },
  "slide-up":  { label: "Slide Up",        icon: "⬆️", description: "Entra de baixo para cima" },
  "slide-down":{ label: "Slide Down",      icon: "⬇️", description: "Entra de cima para baixo" },
  "slide-left":{ label: "Slide Left",      icon: "⬅️", description: "Entra da direita para esquerda" },
  "slide-right":{ label: "Slide Right",   icon: "➡️", description: "Entra da esquerda para direita" },
  "zoom-in":   { label: "Zoom In",         icon: "🔍",  description: "Cresce até o tamanho normal" },
  "zoom-out":  { label: "Zoom Out",        icon: "🔎",  description: "Encolhe a partir do tamanho normal" },
  "bounce-in": { label: "Bounce In",       icon: "🏀",  description: "Entra com efeito de quique" },
  "rotate-in": { label: "Rotate In",       icon: "🌀",  description: "Entra com rotação" },
  "blur-in":   { label: "Blur In",         icon: "🌫️", description: "Aparece desfocado e foca" },
  "scale-pulse":{ label: "Scale Pulse",   icon: "💓",  description: "Pulsa em escala em loop" },
};

export const EASING_OPTIONS: Record<EasingType, string> = {
  linear:      "Linear",
  "ease-in":   "Ease In",
  "ease-out":  "Ease Out (natural)",
  "ease-in-out":"Ease In-Out (suave)",
  bounce:      "Bounce",
  spring:      "Spring",
};

export const DEFAULT_ANIMATION: AnimationConfig = {
  type: "fade-in",
  delay: 0,
  duration: 800,
  easing: "ease-out",
  hold: true,
};
