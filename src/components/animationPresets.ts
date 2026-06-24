export type AnimationPreset = "cinematic-zoom" | "neon-light" | "soft-glitch";

export type PresetLayer = {
  name: string;
  description: string;
};

export type AnimationPresetDetail = {
  title: string;
  summary: string;
  accent: string;
  layers: PresetLayer[];
};

export const PRESET_ORDER: AnimationPreset[] = [
  "cinematic-zoom",
  "neon-light",
  "soft-glitch",
];

export const ANIMATION_PRESETS: Record<AnimationPreset, AnimationPresetDetail> = {
  "cinematic-zoom": {
    title: "Cinematic zoom",
    summary: "Camera lenta, profundidade, vinheta e grao de filme.",
    accent: "amber",
    layers: [
      {
        name: "Depth background",
        description: "Copia desfocada do flyer preenchendo o story.",
      },
      {
        name: "Hero plate",
        description: "Flyer principal com movimento de camera.",
      },
      {
        name: "Light pass",
        description: "Luz suave atravessando a cena.",
      },
      {
        name: "Film finish",
        description: "Vinheta, barras e textura final.",
      },
    ],
  },
  "neon-light": {
    title: "Neon light",
    summary: "Bloom colorido, aura duplicada e scanner luminoso.",
    accent: "cyan",
    layers: [
      {
        name: "Color wash",
        description: "Base saturada para reforcar as cores.",
      },
      {
        name: "Neon aura",
        description: "Copia do flyer em blur para criar brilho.",
      },
      {
        name: "Sweep beam",
        description: "Feixe diagonal animado por cima da arte.",
      },
      {
        name: "Scan texture",
        description: "Linhas finas e pontos de energia.",
      },
    ],
  },
  "soft-glitch": {
    title: "Soft glitch",
    summary: "Canais RGB separados, slices e micro tremor controlado.",
    accent: "rose",
    layers: [
      {
        name: "Stable image",
        description: "Flyer base com movimento minimo.",
      },
      {
        name: "Red channel",
        description: "Copia deslocada para o canal quente.",
      },
      {
        name: "Cyan channel",
        description: "Copia deslocada para o canal frio.",
      },
      {
        name: "Slice breaks",
        description: "Faixas curtas que quebram a imagem.",
      },
    ],
  },
};
