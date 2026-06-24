"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useState } from "react";

type UploadPanelProps = {
  fileName: string;
  onImageUpload: (file: File) => void;
};

export function UploadPanel({ fileName, onImageUpload }: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onImageUpload(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file?.type.startsWith("image/")) {
      onImageUpload(file);
    }
  }

  return (
    <label
      htmlFor="flyer-upload"
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={[
        "group relative grid cursor-pointer gap-4 overflow-hidden rounded-lg border p-5 transition",
        isDragging
          ? "border-cyan-300 bg-cyan-300/10"
          : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]",
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Upload do flyer</p>
          <p className="mt-1 text-sm text-zinc-400">
            Arraste uma imagem ou selecione do computador.
          </p>
        </div>

        <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-950 transition group-hover:bg-cyan-200">
          Escolher
        </span>
      </div>

      <div className="rounded-md border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
        {fileName ? (
          <span className="text-white">{fileName}</span>
        ) : (
          "JPG, PNG ou WebP"
        )}
      </div>

      <input
        id="flyer-upload"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleInputChange}
        className="sr-only"
      />
    </label>
  );
}
