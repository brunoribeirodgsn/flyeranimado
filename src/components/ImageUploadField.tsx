"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useRef, useState } from "react";

type ImageUploadFieldProps = {
  id: string;
  label: string;
  sublabel?: string;
  previewUrl: string | null;
  fileName: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  accept?: string;
  isAvatar?: boolean;
};

export function ImageUploadField({
  id,
  label,
  sublabel,
  previewUrl,
  fileName,
  onUpload,
  onRemove,
  accept = "image/png,image/jpeg,image/webp",
  isAvatar = false,
}: ImageUploadFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (file.type.startsWith("image/")) {
      onUpload(file);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] text-zinc-600">{sublabel}</span>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          "relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border p-3 transition-all",
          isDragging
            ? "border-purple-400/60 bg-purple-400/10"
            : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]",
        ].join(" ")}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt=""
              aria-hidden
              className={[
                "shrink-0 object-cover",
                isAvatar
                  ? "h-14 w-14 rounded-full ring-2 ring-purple-400/40"
                  : "h-14 w-14 rounded-lg",
              ].join(" ")}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {fileName}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">Clique para trocar</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="shrink-0 rounded-full p-1 text-zinc-500 transition hover:bg-white/10 hover:text-white"
              aria-label="Remover imagem"
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <div
              className={[
                "flex shrink-0 items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 text-zinc-500",
                isAvatar ? "h-14 w-14 rounded-full" : "h-14 w-14",
              ].join(" ")}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 16v-8m-4 4h8" strokeLinecap="round" />
                <rect x="3" y="3" width="18" height="18" rx="4" />
              </svg>
            </div>
            <p className="text-sm text-zinc-400">
              Arraste ou{" "}
              <span className="text-purple-300 underline">escolha imagem</span>
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="sr-only"
        />
      </div>
    </div>
  );
}
