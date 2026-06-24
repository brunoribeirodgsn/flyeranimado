import type { ProtectedText } from "./motionProject";

type ProtectedTextPanelProps = {
  protectedText: ProtectedText;
  onProtectedTextChange: (protectedText: ProtectedText) => void;
};

const fields: Array<{
  key: keyof ProtectedText;
  label: string;
  placeholder: string;
}> = [
  {
    key: "eyebrow",
    label: "Chamada pequena",
    placeholder: "PROXIMO EVENTO",
  },
  {
    key: "headline",
    label: "Titulo principal",
    placeholder: "NOME DO SHOW",
  },
  {
    key: "date",
    label: "Data",
    placeholder: "SEX, 28 JUN",
  },
  {
    key: "location",
    label: "Local",
    placeholder: "LOCAL DO EVENTO",
  },
];

export function ProtectedTextPanel({
  protectedText,
  onProtectedTextChange,
}: ProtectedTextPanelProps) {
  return (
    <section className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
          Texto protegido
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Estes textos ficam em uma camada separada, sem tremor, sem glitch e
          sem deformar junto com a imagem.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="grid gap-1.5">
            <span className="text-xs font-semibold text-zinc-500">
              {field.label}
            </span>
            <input
              value={protectedText[field.key]}
              placeholder={field.placeholder}
              onChange={(event) =>
                onProtectedTextChange({
                  ...protectedText,
                  [field.key]: event.target.value,
                })
              }
              className="h-11 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-cyan-300/60"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
