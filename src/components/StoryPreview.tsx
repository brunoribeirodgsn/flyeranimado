/* eslint-disable @next/next/no-img-element -- The preview uses local blob: URLs selected by the user. */
import type { AnimationPreset } from "./animationPresets";
import { ANIMATION_PRESETS } from "./animationPresets";
import type { CanvasFormat, ProtectedText } from "./motionProject";
import { CANVAS_FORMATS } from "./motionProject";

type StoryPreviewProps = {
  imageUrl: string | null;
  preset: AnimationPreset;
  format: CanvasFormat;
  protectedText: ProtectedText;
  animationKey: number;
};

export function StoryPreview({
  imageUrl,
  preset,
  format,
  protectedText,
  animationKey,
}: StoryPreviewProps) {
  const details = ANIMATION_PRESETS[preset];
  const formatDetail = CANVAS_FORMATS[format];
  const hasProtectedText = Object.values(protectedText).some(Boolean);

  return (
    <section className="mx-auto w-full max-w-[430px]">
      <div className="mb-4 flex items-center justify-between text-sm">
        <div>
          <p className="font-semibold text-white">Live story preview</p>
          <p className="mt-1 text-xs text-zinc-500">
            Canvas {formatDetail.size}
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
          {details.title}
        </span>
      </div>

      <div className="story-device">
        <div
          className={`story-stage story-stage-${preset} ${formatDetail.aspectClassName}`}
        >
          {imageUrl ? (
            <div key={animationKey} className="absolute inset-0">
              <img
                src={imageUrl}
                alt=""
                aria-hidden="true"
                className={`stage-layer image-backplate ${preset}-backplate`}
              />
              <img
                src={imageUrl}
                alt="Preview do flyer enviado"
                className={`stage-layer image-main ${preset}-main`}
              />

              {preset === "cinematic-zoom" ? (
                <>
                  <div className="stage-layer cinematic-light" />
                  <div className="stage-layer cinematic-bars" />
                  <div className="stage-layer cinematic-vignette" />
                  <div className="stage-layer film-grain" />
                </>
              ) : null}

              {preset === "neon-light" ? (
                <>
                  <img
                    src={imageUrl}
                    alt=""
                    aria-hidden="true"
                    className="stage-layer neon-aura"
                  />
                  <div className="stage-layer neon-sweep-pro" />
                  <div className="stage-layer neon-scanlines" />
                  <div className="stage-layer neon-particles" />
                </>
              ) : null}

              {preset === "soft-glitch" ? (
                <>
                  <img
                    src={imageUrl}
                    alt=""
                    aria-hidden="true"
                    className="stage-layer glitch-channel glitch-red"
                  />
                  <img
                    src={imageUrl}
                    alt=""
                    aria-hidden="true"
                    className="stage-layer glitch-channel glitch-cyan"
                  />
                  <div className="stage-layer glitch-slice glitch-slice-one" />
                  <div className="stage-layer glitch-slice glitch-slice-two" />
                  <div className="stage-layer glitch-noise" />
                </>
              ) : null}

              {hasProtectedText ? (
                <div className={`stage-layer protected-copy copy-${preset}`}>
                  {protectedText.eyebrow ? (
                    <p className="protected-eyebrow">{protectedText.eyebrow}</p>
                  ) : null}
                  {protectedText.headline ? (
                    <h2 className="protected-headline">
                      {protectedText.headline}
                    </h2>
                  ) : null}
                  <div className="protected-meta">
                    {protectedText.date ? <span>{protectedText.date}</span> : null}
                    {protectedText.location ? (
                      <span>{protectedText.location}</span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-3xl font-light text-white">
                +
              </div>
              <p className="text-xl font-semibold text-white">
                Envie um flyer
              </p>
              <p className="mt-3 max-w-[260px] text-sm leading-6 text-zinc-500">
                O preview monta um story em camadas: fundo, arte, luz, textura
                e acabamento.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
