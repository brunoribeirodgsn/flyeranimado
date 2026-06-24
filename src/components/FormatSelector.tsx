import type { CanvasFormat } from "./motionProject";
import { CANVAS_FORMATS } from "./motionProject";

type FormatSelectorProps = {
  selectedFormat: CanvasFormat;
  onFormatChange: (format: CanvasFormat) => void;
};

const formatOrder: CanvasFormat[] = ["story", "feed", "square"];

export function FormatSelector({
  selectedFormat,
  onFormatChange,
}: FormatSelectorProps) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
        Formato
      </legend>

      <div className="grid gap-2 sm:grid-cols-3">
        {formatOrder.map((format) => {
          const detail = CANVAS_FORMATS[format];
          const isSelected = format === selectedFormat;

          return (
            <button
              key={format}
              type="button"
              onClick={() => onFormatChange(format)}
              className={[
                "rounded-lg border p-3 text-left transition",
                isSelected
                  ? "border-cyan-300/60 bg-cyan-300/10 text-white"
                  : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-white/25",
              ].join(" ")}
            >
              <span className="block text-sm font-semibold">
                {detail.label}
              </span>
              <span className="mt-1 block text-xs text-zinc-500">
                {detail.size}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
