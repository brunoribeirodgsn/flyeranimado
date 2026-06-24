import type { AnimationPreset } from "./animationPresets";
import { ANIMATION_PRESETS } from "./animationPresets";

type PresetSelectorProps = {
  presets: AnimationPreset[];
  selectedPreset: AnimationPreset;
  onPresetChange: (preset: AnimationPreset) => void;
};

export function PresetSelector({
  presets,
  selectedPreset,
  onPresetChange,
}: PresetSelectorProps) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
        Presets profissionais
      </legend>

      <div className="grid gap-3">
        {presets.map((preset) => {
          const details = ANIMATION_PRESETS[preset];
          const isSelected = preset === selectedPreset;

          return (
            <button
              key={preset}
              type="button"
              onClick={() => onPresetChange(preset)}
              className={[
                "group rounded-lg border p-4 text-left transition",
                isSelected
                  ? "border-white/35 bg-white text-zinc-950 shadow-[0_18px_50px_rgba(255,255,255,0.12)]"
                  : "border-white/10 bg-white/[0.035] text-white hover:border-white/25 hover:bg-white/[0.07]",
              ].join(" ")}
            >
              <span className="flex items-center justify-between gap-4">
                <span className="font-semibold">{details.title}</span>
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full",
                    details.accent === "amber" ? "bg-amber-300" : "",
                    details.accent === "cyan" ? "bg-cyan-300" : "",
                    details.accent === "rose" ? "bg-rose-300" : "",
                  ].join(" ")}
                />
              </span>
              <span
                className={[
                  "mt-2 block text-sm leading-6",
                  isSelected ? "text-zinc-600" : "text-zinc-400",
                ].join(" ")}
              >
                {details.summary}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
