"use client";

import type { ChangeEvent, CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

type FlyerMode = "static" | "animated";
type FlyerKind = "evento" | "agenda" | "contrato" | "outro";
type SizeOption = "feed" | "stories" | "landscape";
type ResolutionOption = "480p" | "720p";
type VideoFormat = "story" | "feed";

type UploadSlot = {
  url: string | null;
  name: string;
};

type TemplateCard = {
  id: FlyerKind;
  title: string;
  kicker: string;
  accent: string;
  tone: string;
};

type FlyerFields = {
  headline: string;
  subHeadline: string;
  cta: string;
  footer: string;
  city: string;
  venue: string;
  eventDate: string;
  eventDay: string;
  saleDate: string;
  saleTime: string;
  ticketPlatform: string;
  sponsorLine: string;
};

type CssVars = CSSProperties & Record<`--${string}`, string | number>;

const NAV_PRIMARY = [
  "Biblioteca de Prompts",
  "Biblioteca de Artes",
  "Ferramentas IA",
  "Seedance 2.0",
  "Gerar Imagem",
  "Gerar Video",
];

const NAV_EXTRA = [
  "Upscaler Arcano",
  "Arcano Cloner",
  "Face Changer",
  "Veste AI",
  "MoveLead Maker",
];

const TEMPLATES: TemplateCard[] = [
  {
    id: "evento",
    title: "EVENTO",
    kicker: "AO VIVO DOMINGO",
    accent: "#ff2a06",
    tone: "#fff1f2",
  },
  {
    id: "agenda",
    title: "AGENDA DE ARTISTA",
    kicker: "JUNHO 24",
    accent: "#f59e0b",
    tone: "#fffbeb",
  },
  {
    id: "contrato",
    title: "CONTRATE",
    kicker: "SHOWS E EVENTOS",
    accent: "#10b981",
    tone: "#ecfdf5",
  },
  {
    id: "outro",
    title: "OUTRO",
    kicker: "DIA DE OFERTA",
    accent: "#a855f7",
    tone: "#faf5ff",
  },
];

const DEFAULT_FIELDS: FlyerFields = {
  headline: "HENRIQUE & JULIANO",
  subHeadline: "[+] convidados",
  cta: "INICIO DAS VENDAS",
  footer: "Realizacao / VIVA  DOIS.M  Midia Partner / otem tv",
  city: "Sao Jose do Rio Preto - SP",
  venue: "Recinto de Exposicoes",
  eventDate: "25.04 2026",
  eventDay: "sabado",
  saleDate: "15.12",
  saleTime: "12h",
  ticketPlatform: "guicheweb",
  sponsorLine: "Realizacao / VIVA  DOIS.M  Midia Partner / otem tv",
};

const SAMPLE_THUMBNAILS = [
  { label: "Flyer Estatico", accent: "#14b8a6", stamp: "SEMANA" },
  { label: "Flyer Animado", accent: "#f97316", stamp: "FORRO" },
];

function useImageUpload(): UploadSlot & {
  load: (event: ChangeEvent<HTMLInputElement>) => void;
  clear: () => void;
} {
  const [slot, setSlot] = useState<UploadSlot>({ url: null, name: "" });

  const clear = useCallback(() => {
    setSlot((current) => {
      if (current.url) URL.revokeObjectURL(current.url);
      return { url: null, name: "" };
    });
  }, []);

  const load = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setSlot((current) => {
      if (current.url) URL.revokeObjectURL(current.url);
      return {
        url: URL.createObjectURL(file),
        name: file.name,
      };
    });
  }, []);

  useEffect(() => clear, [clear]);

  return { ...slot, load, clear };
}

function Sidebar() {
  return (
    <aside className="arc-sidebar">
      <div className="arc-sidebar-logo" aria-label="ArcanoApp">
        <span className="arc-logo-mark">A</span>
      </div>

      <button className="arc-collab-btn" type="button">
        Tornar-se Colaborador
      </button>

      <nav className="arc-nav" aria-label="Principal">
        <p className="arc-nav-label">Principal</p>
        {NAV_PRIMARY.map((item) => (
          <button key={item} className="arc-nav-item" type="button">
            <span className="arc-nav-icon" />
            {item}
            {item === "Seedance 2.0" && <span className="arc-beta">Novo</span>}
          </button>
        ))}

        <p className="arc-nav-label">Ferramentas exclusivas</p>
        {NAV_EXTRA.map((item) => (
          <button key={item} className="arc-nav-item" type="button">
            <span className="arc-nav-icon" />
            {item}
          </button>
        ))}

        <button className="arc-nav-item arc-nav-active" type="button">
          <span className="arc-nav-icon" />
          Flyer Maker
        </button>

        <p className="arc-nav-label">Conta</p>
        {["Minhas Criacoes", "Planos", "Creditos", "Config"].map((item) => (
          <button key={item} className="arc-nav-item" type="button">
            <span className="arc-nav-icon" />
            {item}
          </button>
        ))}
      </nav>

      <div className="arc-sidebar-bottom">
        <button className="arc-whatsapp" type="button">
          Grupo do WhatsApp
        </button>
        <button className="arc-credits-gift" type="button">
          Ganhe 500 Creditos!
        </button>
        <button className="arc-exit" type="button">
          Sair
        </button>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="arc-topbar">
      <div className="arc-brandline">
        ArcanoApp - Primeira Plataforma de IA para Designers do Brasil
      </div>
      <div className="arc-top-actions">
        <button type="button">Minhas Criacoes</button>
        <span className="arc-premium">Premium Ativo</span>
        <span className="arc-plan-pill">1.001.609</span>
        <button className="arc-round-btn" type="button" aria-label="Perfil">
          B
        </button>
      </div>
    </header>
  );
}

function MiniPoster({ card }: { card: TemplateCard }) {
  return (
    <div
      className="arc-mini-poster"
      style={
        {
          "--poster-accent": card.accent,
          "--poster-tone": card.tone,
        } as CssVars
      }
    >
      <span>{card.kicker}</span>
      <strong>{card.title}</strong>
      <i />
    </div>
  );
}

function UploadBox({
  id,
  label,
  hint,
  slot,
  compact,
}: {
  id: string;
  label: string;
  hint?: string;
  slot: ReturnType<typeof useImageUpload>;
  compact?: boolean;
}) {
  return (
    <div className="arc-field-block">
      <div className="arc-field-heading">
        <span>{label}</span>
        {hint && <em>{hint}</em>}
      </div>
      <label
        className={compact ? "arc-upload arc-upload-compact" : "arc-upload"}
        htmlFor={id}
      >
        {slot.url ? (
          <>
            <img src={slot.url} alt="" />
            <button
              type="button"
              className="arc-remove-img"
              onClick={(event) => {
                event.preventDefault();
                slot.clear();
              }}
              aria-label="Remover imagem"
            >
              x
            </button>
            <span>Trocar imagem</span>
          </>
        ) : (
          <>
            <span className="arc-upload-icon">+</span>
            <strong>Upload da imagem</strong>
            <small>clique para selecionar</small>
          </>
        )}
        <input id={id} type="file" accept="image/*" onChange={slot.load} />
      </label>
    </div>
  );
}

function TemplateStart({
  mode,
  onModeChange,
  onBackToMode,
  selectedKind,
  onKindChange,
}: {
  mode: FlyerMode | null;
  onModeChange: (mode: FlyerMode) => void;
  onBackToMode: () => void;
  selectedKind: FlyerKind;
  onKindChange: (kind: FlyerKind) => void;
}) {
  if (!mode) {
    return (
      <div className="arc-start">
        <p className="arc-question">Como voce quer criar seu flyer?</p>
        <div className="arc-mode-grid">
          {SAMPLE_THUMBNAILS.map((thumb, index) => (
            <button
              key={thumb.label}
              type="button"
              className="arc-mode-card"
              onClick={() => onModeChange(index === 0 ? "static" : "animated")}
            >
              <div
                className="arc-sample-thumb"
                style={{ "--sample-accent": thumb.accent } as CssVars}
              >
                <span>{thumb.stamp}</span>
                <strong>{index === 0 ? "FESTA" : "FORRO"}</strong>
                {index === 1 && <em>NOVO</em>}
              </div>
              <span>{thumb.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="arc-start">
      <button type="button" className="arc-back" onClick={onBackToMode}>
        Voltar
      </button>
      <p className="arc-question">Qual tipo de flyer vamos fazer hoje?</p>
      <div className="arc-template-grid">
        {TEMPLATES.map((card) => (
          <button
            key={card.id}
            type="button"
            className={[
              "arc-template-choice",
              selectedKind === card.id ? "arc-template-choice-active" : "",
            ].join(" ")}
            onClick={() => onKindChange(card.id)}
          >
            <MiniPoster card={card} />
            <span>{card.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="arc-input-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function StaticForm({
  reference,
  person,
  logo,
  hasPerson,
  setHasPerson,
  fields,
  setFields,
  size,
  setSize,
  creativity,
  setCreativity,
  onGenerate,
  onAnimate,
}: {
  reference: ReturnType<typeof useImageUpload>;
  person: ReturnType<typeof useImageUpload>;
  logo: ReturnType<typeof useImageUpload>;
  hasPerson: boolean;
  setHasPerson: (value: boolean) => void;
  fields: FlyerFields;
  setFields: (fields: FlyerFields) => void;
  size: SizeOption;
  setSize: (size: SizeOption) => void;
  creativity: number;
  setCreativity: (value: number) => void;
  onGenerate: () => void;
  onAnimate: () => void;
}) {
  return (
    <>
      <UploadBox id="reference-art" label="Referencia do Flyer" slot={reference} />

      <section className="arc-toggle-card">
        <div>
          <strong>Possui pessoa na arte?</strong>
          <span>Altere para enviar uma foto.</span>
        </div>
        <button
          type="button"
          aria-pressed={hasPerson}
          className={hasPerson ? "arc-switch arc-switch-on" : "arc-switch"}
          onClick={() => setHasPerson(!hasPerson)}
        >
          <span />
        </button>
        {hasPerson && (
          <UploadBox
            compact
            id="person-photo"
            label="Pessoa principal"
            slot={person}
          />
        )}
      </section>

      <UploadBox
        id="logo-art"
        label="Logo / Outra imagem"
        hint="opcional"
        slot={logo}
        compact
      />

      <FieldInput
        label="Nome principal"
        value={fields.headline}
        onChange={(headline) => setFields({ ...fields, headline })}
      />
      <FieldInput
        label="Convidados / subtitulo"
        value={fields.subHeadline}
        onChange={(subHeadline) => setFields({ ...fields, subHeadline })}
      />
      <FieldInput
        label="Faixa de chamada"
        value={fields.cta}
        onChange={(cta) => setFields({ ...fields, cta })}
      />
      <FieldInput
        label="Cidade / UF"
        value={fields.city}
        onChange={(city) => setFields({ ...fields, city })}
      />
      <FieldInput
        label="Local do evento"
        value={fields.venue}
        onChange={(venue) => setFields({ ...fields, venue })}
      />
      <FieldInput
        label="Data do evento"
        value={fields.eventDate}
        onChange={(eventDate) => setFields({ ...fields, eventDate })}
      />
      <FieldInput
        label="Dia da semana"
        value={fields.eventDay}
        onChange={(eventDay) => setFields({ ...fields, eventDay })}
      />
      <FieldInput
        label="Data das vendas"
        value={fields.saleDate}
        onChange={(saleDate) => setFields({ ...fields, saleDate })}
      />
      <FieldInput
        label="Hora das vendas"
        value={fields.saleTime}
        onChange={(saleTime) => setFields({ ...fields, saleTime })}
      />
      <FieldInput
        label="Plataforma de venda"
        value={fields.ticketPlatform}
        onChange={(ticketPlatform) => setFields({ ...fields, ticketPlatform })}
      />
      <FieldInput
        label="Rodape / marcas"
        value={fields.sponsorLine}
        onChange={(sponsorLine) => setFields({ ...fields, sponsorLine })}
      />

      <section className="arc-segment">
        <span>Tamanho</span>
        <div>
          {(["feed", "stories", "landscape"] as SizeOption[]).map((option) => (
            <button
              key={option}
              type="button"
              className={size === option ? "arc-selected" : ""}
              onClick={() => setSize(option)}
            >
              {option === "feed"
                ? "Feed"
                : option === "stories"
                  ? "Stories"
                  : "Landscape"}
            </button>
          ))}
        </div>
      </section>

      <section className="arc-creativity">
        <div className="arc-field-heading">
          <span>Criatividade da IA</span>
          <em>{creativity}</em>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={creativity}
          onChange={(event) => setCreativity(Number(event.target.value))}
        />
        <div className="arc-range-labels">
          <span>Mais fiel</span>
          <span>Muito criativo</span>
        </div>
      </section>

      <button className="arc-main-action" type="button" onClick={onGenerate}>
        Gerar flyer com IA
      </button>

      <div className="arc-action-row">
        <button type="button">Nova</button>
        <button type="button">Aprimorar</button>
      </div>

      <button className="arc-animate-btn" type="button" onClick={onAnimate}>
        Animar
      </button>
    </>
  );
}

function GeneratedFlyer({
  fields,
  personUrl,
  logoUrl,
  referenceUrl,
  compact = false,
  animated = false,
}: {
  fields: FlyerFields;
  personUrl: string | null;
  logoUrl: string | null;
  referenceUrl: string | null;
  compact?: boolean;
  animated?: boolean;
}) {
  const headlineParts = fields.headline.split("&");
  const firstName = headlineParts[0]?.trim() || fields.headline;
  const secondName = headlineParts.slice(1).join("&").trim();

  return (
    <div
      className={[
        "ref-flyer",
        compact ? "ref-flyer-compact" : "",
        animated ? "ref-flyer-animated" : "",
      ].join(" ")}
    >
      {referenceUrl && <img className="ref-source" src={referenceUrl} alt="" />}

      <div className="ref-bg ref-bg-orange-left" />
      <div className="ref-bg ref-bg-gray-top" />
      <div className="ref-bg ref-bg-gray-right" />
      <div className="ref-bg ref-bg-orange-bottom" />
      <div className="ref-bg ref-bg-stripes" />

      <section className="ref-location">
        <span>●</span>
        <strong>{fields.city}</strong>
        <p>{fields.venue}</p>
      </section>

      <section className="ref-date">
        <strong>{fields.eventDate}</strong>
        <p>{fields.eventDay}</p>
      </section>

      <span className="ref-arrow ref-arrow-left">↖</span>
      <span className="ref-arrow ref-arrow-right">↓</span>
      <span className="ref-arrow ref-arrow-up">↑</span>

      <div className="ref-people">
        {personUrl ? (
          <>
            <img className="ref-person ref-person-main" src={personUrl} alt="" />
            <img className="ref-person ref-person-second" src={personUrl} alt="" />
          </>
        ) : (
          <>
            <div className="ref-person-placeholder ref-person-main" />
            <div className="ref-person-placeholder ref-person-second" />
          </>
        )}
      </div>

      <section className="ref-title-box">
        <h3>
          <span>{firstName}</span>
          {secondName ? (
            <span>
              <em>&</em>
              {secondName}
            </span>
          ) : null}
        </h3>
        <p>{fields.subHeadline}</p>
      </section>

      <div className="ref-sale-label">{fields.cta}</div>
      <section className="ref-sale-box">
        <strong>
          {fields.saleDate} <span>|</span> {fields.saleTime}
        </strong>
        <p>▣ {fields.ticketPlatform}</p>
      </section>

      <footer className="ref-sponsors">
        {logoUrl && <img src={logoUrl} alt="" />}
        <span>{fields.sponsorLine || fields.footer}</span>
      </footer>

      <div className="ref-frame" />
      <div className="ref-dash-bottom" />
      <div className="ref-dash-left" />
      <div className="ref-dash-right" />
    </div>
  );
}

function AnimatedForm({
  fields,
  referenceUrl,
  personUrl,
  logoUrl,
  format,
  setFormat,
  resolution,
  setResolution,
  onGenerate,
  onBack,
}: {
  fields: FlyerFields;
  referenceUrl: string | null;
  personUrl: string | null;
  logoUrl: string | null;
  format: VideoFormat;
  setFormat: (format: VideoFormat) => void;
  resolution: ResolutionOption;
  setResolution: (resolution: ResolutionOption) => void;
  onGenerate: () => void;
  onBack: () => void;
}) {
  return (
    <div className="arc-animated-form">
      <button type="button" className="arc-back" onClick={onBack}>
        Voltar
      </button>
      <h2>Flyer Animado</h2>
      <p>Video gerado por IA a partir do flyer no estilo da referencia.</p>

      <div className="arc-video-source">
        <GeneratedFlyer
          compact
          fields={fields}
          referenceUrl={referenceUrl}
          personUrl={personUrl}
          logoUrl={logoUrl}
        />
      </div>

      <section className="arc-fast-row">
        <div>
          <strong>Motor da IA</strong>
          <span>Seedance Pro</span>
        </div>
        <button className="arc-switch arc-switch-on" type="button">
          <span />
        </button>
      </section>

      <label className="arc-input-field">
        <span>Duracao</span>
        <input value="10 segundos" readOnly />
      </label>

      <section className="arc-choice-grid">
        <span>Formato do Video (Pro)</span>
        <div>
          {(["story", "feed"] as VideoFormat[]).map((option) => (
            <button
              key={option}
              type="button"
              className={format === option ? "arc-selected" : ""}
              onClick={() => setFormat(option)}
            >
              <strong>{option === "story" ? "9:16" : "4:5"}</strong>
              <small>{option === "story" ? "Stories / Reels" : "Feed / Post"}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="arc-choice-grid">
        <span>Resolucao</span>
        <div>
          {(["480p", "720p"] as ResolutionOption[]).map((option) => (
            <button
              key={option}
              type="button"
              className={resolution === option ? "arc-selected" : ""}
              onClick={() => setResolution(option)}
            >
              {option === "480p" ? "480p - 9:1200" : "720p - 9:2500"}
            </button>
          ))}
        </div>
      </section>

      <button className="arc-main-action" type="button" onClick={onGenerate}>
        Gerar flyer animado <span>1200</span>
      </button>
      <small className="arc-estimate">
        Tempo estimado: 2-4 minutos. Voce pode continuar usando o app.
      </small>
    </div>
  );
}

function ResultPanel({
  hasGenerated,
  mode,
  fields,
  referenceUrl,
  personUrl,
  logoUrl,
  onDownload,
}: {
  hasGenerated: boolean;
  mode: FlyerMode | null;
  fields: FlyerFields;
  referenceUrl: string | null;
  personUrl: string | null;
  logoUrl: string | null;
  onDownload: () => void;
}) {
  return (
    <section className="arc-result-card">
      <div className="arc-panel-title">
        <span>Resultado</span>
        {hasGenerated && (
          <div>
            <button type="button" aria-label="Zoom">
              +
            </button>
            <button type="button" aria-label="Expandir">
              []
            </button>
          </div>
        )}
      </div>

      {!hasGenerated ? (
        <div className="arc-empty-result">
          <div>▧</div>
          <p>O resultado aparecera aqui</p>
        </div>
      ) : mode === "animated" ? (
        <div className="arc-video-result">
          <GeneratedFlyer
            animated
            fields={fields}
            referenceUrl={referenceUrl}
            personUrl={personUrl}
            logoUrl={logoUrl}
          />
          <div className="arc-player-bar">
            <span>▶</span>
            <strong>0:09 / 0:10</strong>
            <i />
            <span>⛶</span>
          </div>
          <button className="arc-download-video" type="button" onClick={onDownload}>
            Baixar Video
          </button>
        </div>
      ) : (
        <div className="arc-static-result">
          <GeneratedFlyer
            fields={fields}
            referenceUrl={referenceUrl}
            personUrl={personUrl}
            logoUrl={logoUrl}
          />
          <button className="arc-download-hd" type="button" onClick={onDownload}>
            Baixar HD
          </button>
        </div>
      )}
    </section>
  );
}

export function FlyerMaker() {
  const reference = useImageUpload();
  const person = useImageUpload();
  const logo = useImageUpload();

  const [mode, setMode] = useState<FlyerMode | null>(null);
  const [kindPicked, setKindPicked] = useState(false);
  const [selectedKind, setSelectedKind] = useState<FlyerKind>("evento");
  const [fields, setFields] = useState<FlyerFields>(DEFAULT_FIELDS);
  const [hasPerson, setHasPerson] = useState(false);
  const [size, setSize] = useState<SizeOption>("feed");
  const [creativity, setCreativity] = useState(1);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [videoFormat, setVideoFormat] = useState<VideoFormat>("feed");
  const [resolution, setResolution] = useState<ResolutionOption>("480p");
  const [toast, setToast] = useState("");

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === selectedKind) ?? TEMPLATES[0],
    [selectedKind],
  );

  function chooseMode(nextMode: FlyerMode) {
    setMode(nextMode);
    setKindPicked(false);
    setHasGenerated(false);
  }

  function generate(nextMode = mode) {
    setMode(nextMode);
    setHasGenerated(true);
    setToast(
      nextMode === "animated"
        ? "Flyer animado gerado seguindo a referencia."
        : "Flyer gerado seguindo a referencia.",
    );
  }

  function escapeMarkup(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function downloadMock() {
    const safe = Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, escapeMarkup(value)]),
    ) as FlyerFields;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
<rect width="1080" height="1350" fill="#030303"/>
<rect x="0" y="280" width="300" height="285" fill="#ff2a06"/>
<rect x="380" y="0" width="350" height="280" fill="#d9d9d9"/>
<rect x="970" y="280" width="110" height="360" fill="#d9d9d9"/>
<text x="48" y="138" fill="#ff2a06" font-size="34">●</text>
<text x="48" y="185" fill="#f2f2f2" font-family="Arial Black,Arial" font-size="52">${safe.city}</text>
<text x="48" y="228" fill="#f2f2f2" font-family="Arial" font-size="34">${safe.venue}</text>
<text x="790" y="116" fill="#f2f2f2" font-family="Arial Black,Arial" font-size="64">${safe.eventDate}</text>
<text x="790" y="178" fill="#ff2a06" font-family="Arial Black,Arial" font-size="46">${safe.eventDay}</text>
<text x="70" y="445" fill="#050505" font-family="Arial Black,Arial" font-size="170">↖</text>
<ellipse cx="410" cy="505" rx="165" ry="260" fill="#f3f3f3"/>
<ellipse cx="660" cy="510" rx="155" ry="250" fill="#d8d8d8"/>
<rect x="260" y="630" width="560" height="270" fill="#030303"/>
<text x="298" y="745" fill="#d9d9d9" font-family="Arial Black,Arial" font-size="82">${safe.headline}</text>
<text x="620" y="855" fill="#ff2a06" font-family="Arial Black,Arial" font-size="32">${safe.subHeadline}</text>
<rect x="228" y="900" width="630" height="54" fill="#ff2a06"/>
<text x="265" y="939" fill="#080808" font-family="Arial Black,Arial" font-size="36" letter-spacing="16">${safe.cta}</text>
<rect x="228" y="960" width="640" height="228" fill="#030303"/>
<text x="540" y="1072" text-anchor="middle" fill="#d8d8d8" font-family="Arial Black,Arial" font-size="92">${safe.saleDate} | ${safe.saleTime}</text>
<text x="540" y="1145" text-anchor="middle" fill="#d8d8d8" font-family="Arial Black,Arial" font-size="40">▣ ${safe.ticketPlatform}</text>
<rect x="205" y="1260" width="680" height="64" fill="#d9d9d9"/>
<text x="540" y="1304" text-anchor="middle" fill="#111" font-family="Arial Black,Arial" font-size="26">${safe.sponsorLine}</text>
</svg>`;
    const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Flyer animado</title><style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#080808}.stage{width:min(430px,90vw);aspect-ratio:4/5;overflow:hidden;box-shadow:0 30px 90px #000;background:#111}.stage svg{width:100%;height:100%;animation:zoom 10s ease-in-out infinite alternate}.light{position:fixed;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,45,0,.75),transparent 58%);mix-blend-mode:screen;animation:sweep 2.4s linear infinite}@keyframes zoom{to{transform:scale(1.04)}}@keyframes sweep{from{transform:translateX(-100%) rotate(-10deg)}to{transform:translateX(100%) rotate(-10deg)}}
</style><main class="stage">${svg}<i class="light"></i></main></html>`;
    const isAnimated = mode === "animated";
    const blob = new Blob([isAnimated ? html : svg], {
      type: isAnimated ? "text/html" : "image/svg+xml",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = isAnimated ? "flyer-animado.html" : "flyer-referencia.svg";
    anchor.click();
    URL.revokeObjectURL(url);
    setToast("Download iniciado.");
  }

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <main
      className="arc-app"
      style={
        {
          "--active-accent": selectedTemplate.accent,
          "--active-tone": selectedTemplate.tone,
        } as CssVars
      }
    >
      <Sidebar />

      <section className="arc-workspace">
        <Topbar />

        <div className="arc-content">
          <section className="arc-tool-card">
            <div className="arc-tool-heading">
              <div>
                <h1>Flyer Maker</h1>
                <p>Crie flyers profissionais a partir de uma referencia e seus dados.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode(null);
                  setKindPicked(false);
                  setHasGenerated(false);
                }}
              >
                Reiniciar
              </button>
            </div>

            {!mode || !kindPicked ? (
              <TemplateStart
                mode={mode}
                onModeChange={chooseMode}
                onBackToMode={() => {
                  setMode(null);
                  setKindPicked(false);
                }}
                selectedKind={selectedKind}
                onKindChange={(kind) => {
                  setSelectedKind(kind);
                  setKindPicked(true);
                }}
              />
            ) : (
              <>
                <div className="arc-current-flow">
                  <button className="arc-back" type="button" onClick={() => setMode(null)}>
                    Voltar
                  </button>
                  <strong>{mode === "static" ? "Flyer Estatico" : "Flyer Animado"}</strong>
                  <span>{selectedTemplate.title}</span>
                </div>

                {mode === "static" ? (
                  <StaticForm
                    reference={reference}
                    person={person}
                    logo={logo}
                    hasPerson={hasPerson}
                    setHasPerson={setHasPerson}
                    fields={fields}
                    setFields={setFields}
                    size={size}
                    setSize={setSize}
                    creativity={creativity}
                    setCreativity={setCreativity}
                    onGenerate={() => generate("static")}
                    onAnimate={() => generate("animated")}
                  />
                ) : (
                  <AnimatedForm
                    fields={fields}
                    referenceUrl={reference.url}
                    personUrl={hasPerson ? person.url : null}
                    logoUrl={logo.url}
                    format={videoFormat}
                    setFormat={setVideoFormat}
                    resolution={resolution}
                    setResolution={setResolution}
                    onGenerate={() => generate("animated")}
                    onBack={() => setMode("static")}
                  />
                )}
              </>
            )}
          </section>

          <ResultPanel
            hasGenerated={hasGenerated}
            mode={mode}
            fields={fields}
            referenceUrl={reference.url}
            personUrl={hasPerson ? person.url : null}
            logoUrl={logo.url}
            onDownload={downloadMock}
          />
        </div>
      </section>

      <button className="arc-help" type="button" aria-label="Ajuda">
        ✓
      </button>

      {toast && <div className="arc-toast">{toast}</div>}
    </main>
  );
}
