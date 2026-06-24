"use client";

import { useEffect, useState } from "react";
import type { AnimationPreset } from "./animationPresets";
import { ANIMATION_PRESETS, PRESET_ORDER } from "./animationPresets";
import { FormatSelector } from "./FormatSelector";
import { LayerStack } from "./LayerStack";
import type { CanvasFormat, ProtectedText } from "./motionProject";
import { DEFAULT_PROTECTED_TEXT } from "./motionProject";
import { PresetSelector } from "./PresetSelector";
import { ProtectedTextPanel } from "./ProtectedTextPanel";
import { StoryPreview } from "./StoryPreview";
import { UploadPanel } from "./UploadPanel";

export function FlyerAnimator() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [selectedPreset, setSelectedPreset] =
    useState<AnimationPreset>("cinematic-zoom");
  const [selectedFormat, setSelectedFormat] = useState<CanvasFormat>("story");
  const [protectedText, setProtectedText] = useState<ProtectedText>(
    DEFAULT_PROTECTED_TEXT,
  );
  const [animationKey, setAnimationKey] = useState(0);

  function loadImageFile(file: File) {
    const nextImageUrl = URL.createObjectURL(file);

    setImageUrl((currentImageUrl) => {
      if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
      }

      return nextImageUrl;
    });

    setFileName(file.name);
    setAnimationKey((currentKey) => currentKey + 1);
  }

  function handlePresetChange(preset: AnimationPreset) {
    setSelectedPreset(preset);

    // Remounting the preview restarts every layer animation at the same time.
    setAnimationKey((currentKey) => currentKey + 1);
  }

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#06060f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(125,92,255,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_24%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />

      <section className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(390px,0.72fr)] lg:items-center lg:px-12">
        <div className="grid gap-7">
          <header className="max-w-3xl">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
              Layer based motion studio
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] sm:text-7xl">
              Flyer Animator
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Um MVP para transformar flyers estaticos em previews de story com
              composicao por camadas: profundidade, luz, textura, movimento e
              acabamento visual.
            </p>
          </header>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid gap-4 rounded-lg border border-white/10 bg-[#10101a]/80 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur sm:p-5">
              <UploadPanel fileName={fileName} onImageUpload={loadImageFile} />
              <FormatSelector
                selectedFormat={selectedFormat}
                onFormatChange={setSelectedFormat}
              />
              <PresetSelector
                presets={PRESET_ORDER}
                selectedPreset={selectedPreset}
                onPresetChange={handlePresetChange}
              />
              <ProtectedTextPanel
                protectedText={protectedText}
                onProtectedTextChange={setProtectedText}
              />
            </div>

            <LayerStack
              preset={selectedPreset}
              includeProtectedText={Object.values(protectedText).some(Boolean)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {PRESET_ORDER.map((preset) => (
              <div
                key={preset}
                className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
              >
                <p className="text-sm font-semibold text-white">
                  {ANIMATION_PRESETS[preset].title}
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {ANIMATION_PRESETS[preset].layers.length} camadas animadas
                </p>
              </div>
            ))}
          </div>
        </div>

        <StoryPreview
          imageUrl={imageUrl}
          preset={selectedPreset}
          format={selectedFormat}
          protectedText={protectedText}
          animationKey={animationKey}
        />
      </section>
    </main>
  );
}
