"use client";

/**
 * Global pixel store — keeps full-resolution HTMLCanvasElement objects for
 * each PSD layer OUTSIDE of React state, so that React never serialises or
 * copies megabytes of pixel data on every state update.
 *
 * This module is marked "use client" so it is NEVER imported by the server.
 * All server-side code should only use the lightweight PsdLayer metadata from
 * @/types/psd (which has no pixel data at all).
 */

const store = new Map<string, HTMLCanvasElement>();

export function storeLayerCanvas(id: string, canvas: HTMLCanvasElement): void {
  store.set(id, canvas);
}

export function getLayerCanvas(id: string): HTMLCanvasElement | undefined {
  return store.get(id);
}

export function clearLayerPixelStore(): void {
  store.clear();
}
