"use client";

import { useState } from "react";
import type { PsdDocument, PsdLayer, AnimationType, EasingType } from "@/types/psd";
import { ANIMATION_PRESETS, EASING_OPTIONS } from "@/types/psd";

interface Props {
  document: PsdDocument;
  onLayersChange: (layers: PsdLayer[]) => void;
  onSuggestWithAI: () => void;
  isAnalyzing: boolean;
  aiStyle?: string;
  hasApiKey: boolean;
}

interface LayerItemProps {
  layer: PsdLayer;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: PsdLayer) => void;
}

function LayerItem({ layer, isSelected, onSelect, onChange }: LayerItemProps) {
  const anim = layer.animation;
  const preset = ANIMATION_PRESETS[anim.type];

  return (
    <div
      className={`layer-item ${isSelected ? "selected" : ""} ${!layer.visible ? "hidden-layer" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      aria-label={`Camada: ${layer.name}`}
    >
      <div className="layer-item-header">
        {/* Thumbnail */}
        <div className="layer-thumb-wrap">
          {layer.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={layer.thumbnail}
              alt={layer.name}
              className="layer-thumb"
            />
          ) : (
            <div className="layer-thumb-empty">?</div>
          )}
        </div>

        {/* Info */}
        <div className="layer-info">
          <span className="layer-name">{layer.name}</span>
          <span className="layer-size">
            {layer.width}×{layer.height}px
          </span>
          <span className="layer-anim-badge" title={preset.description}>
            {preset.icon} {preset.label}
          </span>
        </div>

        {/* Visible toggle */}
        <button
          className={`layer-vis-btn ${layer.visible ? "vis-on" : "vis-off"}`}
          onClick={(e) => {
            e.stopPropagation();
            onChange({ ...layer, visible: !layer.visible });
          }}
          title={layer.visible ? "Ocultar camada" : "Mostrar camada"}
          aria-label={layer.visible ? "Ocultar camada" : "Mostrar camada"}
        >
          {layer.visible ? "👁" : "🙈"}
        </button>
      </div>

      {/* Expanded controls */}
      {isSelected && (
        <div className="layer-controls" onClick={(e) => e.stopPropagation()}>
          {/* Animation type */}
          <div className="ctrl-group">
            <label className="ctrl-label">Animação</label>
            <div className="anim-grid">
              {(Object.keys(ANIMATION_PRESETS) as AnimationType[]).map((type) => {
                const p = ANIMATION_PRESETS[type];
                return (
                  <button
                    key={type}
                    className={`anim-btn ${anim.type === type ? "active" : ""}`}
                    onClick={() => onChange({ ...layer, animation: { ...anim, type } })}
                    title={p.description}
                    aria-label={p.label}
                    aria-pressed={anim.type === type}
                  >
                    <span className="anim-btn-icon">{p.icon}</span>
                    <span className="anim-btn-label">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delay */}
          <div className="ctrl-group">
            <label className="ctrl-label">
              Delay de entrada <span className="ctrl-value">{anim.delay}ms</span>
            </label>
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={anim.delay}
              onChange={(e) =>
                onChange({ ...layer, animation: { ...anim, delay: Number(e.target.value) } })
              }
              className="ctrl-slider"
              aria-label="Delay de entrada"
            />
          </div>

          {/* Duration */}
          <div className="ctrl-group">
            <label className="ctrl-label">
              Duração <span className="ctrl-value">{anim.duration}ms</span>
            </label>
            <input
              type="range"
              min="200"
              max="2500"
              step="100"
              value={anim.duration}
              onChange={(e) =>
                onChange({ ...layer, animation: { ...anim, duration: Number(e.target.value) } })
              }
              className="ctrl-slider"
              aria-label="Duração da animação"
            />
          </div>

          {/* Easing */}
          <div className="ctrl-group">
            <label className="ctrl-label">Easing</label>
            <select
              className="ctrl-select"
              value={anim.easing}
              onChange={(e) =>
                onChange({ ...layer, animation: { ...anim, easing: e.target.value as EasingType } })
              }
              aria-label="Tipo de easing"
            >
              {(Object.entries(EASING_OPTIONS) as [EasingType, string][]).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Loop toggle */}
          <div className="ctrl-group ctrl-row">
            <label className="ctrl-label ctrl-label-inline">Loop</label>
            <button
              className={`toggle-btn ${anim.loop ? "active" : ""}`}
              onClick={() => onChange({ ...layer, animation: { ...anim, loop: !anim.loop } })}
              aria-pressed={anim.loop}
              aria-label="Ativar loop"
            >
              {anim.loop ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LayerPanel({
  document: doc,
  onLayersChange,
  onSuggestWithAI,
  isAnalyzing,
  aiStyle,
  hasApiKey,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleLayerChange = (updated: PsdLayer) => {
    onLayersChange(doc.layers.map((l) => (l.id === updated.id ? updated : l)));
  };

  const visibleCount = doc.layers.filter((l) => l.visible).length;

  return (
    <div className="layer-panel">
      {/* Panel Header */}
      <div className="layer-panel-header">
        <div className="layer-panel-meta">
          <span className="layer-count">{doc.layers.length} camadas</span>
          <span className="layer-doc-size">
            {doc.width}×{doc.height}px
          </span>
          <span className="layer-filename" title={doc.fileName}>
            📄 {doc.fileName}
          </span>
        </div>

        <button
          id="ai-suggest-btn"
          className={`ai-btn ${isAnalyzing ? "loading" : ""} ${!hasApiKey ? "disabled" : ""}`}
          onClick={onSuggestWithAI}
          disabled={isAnalyzing || !hasApiKey}
          title={!hasApiKey ? "Configure GEMINI_API_KEY em .env.local" : "Analisar camadas com Gemini AI"}
        >
          {isAnalyzing ? (
            <>
              <span className="ai-btn-spinner" />
              Analisando...
            </>
          ) : (
            <>
              <span>✨</span>
              Sugerir com IA
            </>
          )}
        </button>
      </div>

      {/* AI Style description */}
      {aiStyle && (
        <div className="ai-style-banner">
          <span className="ai-style-icon">🤖</span>
          <span className="ai-style-text">{aiStyle}</span>
        </div>
      )}

      {!hasApiKey && (
        <div className="api-key-warning">
          ⚠️ Configure <code>GEMINI_API_KEY</code> em <code>.env.local</code> para usar IA.
        </div>
      )}

      {/* Layer List */}
      <div className="layer-list" role="list" aria-label="Lista de camadas">
        {[...doc.layers].reverse().map((layer) => (
          <LayerItem
            key={layer.id}
            layer={layer}
            isSelected={selectedId === layer.id}
            onSelect={() => setSelectedId(selectedId === layer.id ? null : layer.id)}
            onChange={handleLayerChange}
          />
        ))}
      </div>

      <div className="layer-panel-footer">
        <span>{visibleCount} camadas visíveis</span>
        <button
          className="reset-anim-btn"
          onClick={() => {
            onLayersChange(
              doc.layers.map((l) => ({
                ...l,
                animation: { type: "fade-in", delay: 0, duration: 800, easing: "ease-out", hold: true, loop: false },
              }))
            );
          }}
          aria-label="Resetar todas as animações"
        >
          ↺ Resetar animações
        </button>
      </div>
    </div>
  );
}
