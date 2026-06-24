export type CanvasFormat = "story" | "feed" | "landscape" | "square";

export type ProtectedText = {
  eyebrow: string;
  headline: string;
  date: string;
  location: string;
};

export type FlyerData = {
  artistPhoto: string | null;
  artistPhotoName: string;
  logo: string | null;
  logoName: string;
  eyebrow: string;
  headline: string;
  subHeadline: string;
  date: string;
  location: string;
  callToAction: string;
  footerInfo: string;
  accentColor: string;
};

export type CanvasFormatDetail = {
  label: string;
  size: string;
  aspectClassName: string;
};

export const CANVAS_FORMATS: Record<CanvasFormat, CanvasFormatDetail> = {
  story: {
    label: "Stories / Reels",
    size: "1080 x 1920",
    aspectClassName: "stage-format-story",
  },
  feed: {
    label: "Feed / Post",
    size: "1080 x 1350",
    aspectClassName: "stage-format-feed",
  },
  landscape: {
    label: "Landscape",
    size: "1920 x 1080",
    aspectClassName: "stage-format-landscape",
  },
  square: {
    label: "Square",
    size: "1080 x 1080",
    aspectClassName: "stage-format-square",
  },
};

export const DEFAULT_FLYER_DATA: FlyerData = {
  artistPhoto: null,
  artistPhotoName: "",
  logo: null,
  logoName: "",
  eyebrow: "PROXIMO EVENTO",
  headline: "NOME DO ARTISTA",
  subHeadline: "Forro - Sertanejo - Funk",
  date: "SEX, 28 JUN",
  location: "Arena XYZ - Sao Paulo",
  callToAction: "Compre seu ingresso",
  footerInfo: "@nomeartista",
  accentColor: "#a855f7",
};

export const DEFAULT_PROTECTED_TEXT: ProtectedText = {
  eyebrow: "PROXIMO EVENTO",
  headline: "NOME DO SHOW",
  date: "SEX, 28 JUN",
  location: "LOCAL DO EVENTO",
};

export type AnimationPreset = "neon-glow" | "fire-energy" | "cinematic";

export const ANIMATION_PRESETS: Record<
  AnimationPreset,
  { label: string; accent: string }
> = {
  "neon-glow": { label: "Neon Glow", accent: "#a855f7" },
  "fire-energy": { label: "Fire Energy", accent: "#f97316" },
  cinematic: { label: "Cinematic", accent: "#facc15" },
};

export const PRESET_ORDER: AnimationPreset[] = [
  "neon-glow",
  "fire-energy",
  "cinematic",
];
