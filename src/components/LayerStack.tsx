import type { AnimationPreset } from "./animationPresets";
import { ANIMATION_PRESETS } from "./animationPresets";

type LayerStackProps = {
  preset: AnimationPreset;
  includeProtectedText: boolean;
};

export function LayerStack({ preset, includeProtectedText }: LayerStackProps) {
  const layers = includeProtectedText
    ? [
        ...ANIMATION_PRESETS[preset].layers,
        {
          name: "Protected text",
          description: "Texto final renderizado limpo por cima da animacao.",
        },
      ]
    : ANIMATION_PRESETS[preset].layers;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
          Camadas ativas
        </p>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-400">
          {layers.length} layers
        </span>
      </div>

      <ol className="grid gap-2">
        {layers.map((layer, index) => (
          <li
            key={layer.name}
            className="grid grid-cols-[32px_1fr] gap-3 rounded-md border border-white/10 bg-black/20 p-3"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-xs font-black text-zinc-950">
              {index + 1}
            </span>
            <span>
              <span className="block text-sm font-semibold text-white">
                {layer.name}
              </span>
              <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
                {layer.description}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
