"use client";

/* eslint-disable @next/next/no-img-element */
import type { AnimationPreset, FlyerData } from "./motionProject";
import { CANVAS_FORMATS } from "./motionProject";
import type { CanvasFormat } from "./motionProject";

type FlyerPreviewProps = {
  data: FlyerData;
  format: CanvasFormat;
  preset: AnimationPreset;
  animationKey: number;
};

export function FlyerPreview({
  data,
  format,
  preset,
  animationKey,
}: FlyerPreviewProps) {
  const fmt = CANVAS_FORMATS[format];
  const hasContent = data.artistPhoto || data.headline;

  return (
    <section className="mx-auto w-full max-w-[390px]">
      {/* Label bar */}
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-semibold text-white">Preview ao vivo</span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-zinc-400">
          {fmt.size}
        </span>
      </div>

      {/* Device frame */}
      <div className="flyer-device">
        <div
          className={`flyer-stage flyer-stage-${preset} ${fmt.aspectClassName}`}
        >
          {hasContent ? (
            <div key={animationKey} className="absolute inset-0">
              {/* ── Camada 1: fundo borrado ── */}
              {data.artistPhoto && (
                <img
                  src={data.artistPhoto}
                  alt=""
                  aria-hidden
                  className={`fl-layer fl-backplate fl-bp-${preset}`}
                />
              )}

              {/* ── Camada 2: gradiente de palco ── */}
              <div className={`fl-layer fl-stage-gradient fl-sg-${preset}`} />

              {/* ── Camada 3: foto do artista ── */}
              {data.artistPhoto && (
                <img
                  src={data.artistPhoto}
                  alt={data.headline}
                  className={`fl-layer fl-artist fl-artist-${preset}`}
                />
              )}

              {/* ── Camada 4: efeitos do preset ── */}
              {preset === "neon-glow" && (
                <>
                  <div className="fl-layer fl-neon-sweep" />
                  <div className="fl-layer fl-neon-particles" />
                  <div className="fl-layer fl-neon-scanlines" />
                </>
              )}
              {preset === "fire-energy" && (
                <>
                  <div className="fl-layer fl-fire-ember" />
                  <div className="fl-layer fl-fire-flare" />
                </>
              )}
              {preset === "cinematic" && (
                <>
                  <div className="fl-layer fl-cine-bars" />
                  <div className="fl-layer fl-cine-light" />
                  <div className="fl-layer fl-cine-grain" />
                </>
              )}

              {/* ── Camada 5: logo (topo) ── */}
              {data.logo && (
                <div className="fl-layer fl-logo-zone">
                  <img
                    src={data.logo}
                    alt="Logo"
                    className="fl-logo-img"
                  />
                </div>
              )}

              {/* ── Camada 6: footer handle ── */}
              {data.footerInfo && (
                <div className="fl-layer fl-footer-zone">
                  <span className="fl-footer-handle">{data.footerInfo}</span>
                </div>
              )}

              {/* ── Camada 7: texto protegido ── */}
              <div className={`fl-layer fl-copy fl-copy-${preset}`}>
                {data.eyebrow && (
                  <p className="fl-eyebrow">{data.eyebrow}</p>
                )}
                {data.headline && (
                  <h2 className="fl-headline">{data.headline}</h2>
                )}
                {data.subHeadline && (
                  <p className="fl-subheadline">{data.subHeadline}</p>
                )}

                <div className="fl-meta">
                  {data.date && <span className="fl-meta-pill">{data.date}</span>}
                  {data.location && (
                    <span className="fl-meta-pill">{data.location}</span>
                  )}
                </div>

                {data.callToAction && (
                  <div className="fl-cta">{data.callToAction}</div>
                )}
              </div>

              {/* ── Camada 8: vignette final ── */}
              <div className="fl-layer fl-vignette" />
            </div>
          ) : (
            /* Empty state */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-3xl text-zinc-500">
                🎵
              </div>
              <div>
                <p className="font-semibold text-white">Preencha os dados</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  O flyer animado aparecerá aqui em tempo real
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
