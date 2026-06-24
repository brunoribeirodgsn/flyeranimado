import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import type { GeminiAnalysisResponse, LayerSuggestion, AnimationConfig } from "@/types/psd";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

interface LayerInput {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  opacity: number;
  order: number;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada. Adicione em .env.local e no Vercel." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { layers, documentWidth, documentHeight } = body as {
      layers: LayerInput[];
      documentWidth: number;
      documentHeight: number;
    };

    if (!layers || layers.length === 0) {
      return NextResponse.json({ error: "Nenhuma camada enviada." }, { status: 400 });
    }

    const layersList = layers
      .map(
        (l) =>
          `- ID: "${l.id}" | Nome: "${l.name}" | Posição: (${l.x}, ${l.y}) | Tamanho: ${l.width}x${l.height} | Ordem: ${l.order} (0=mais abaixo)`
      )
      .join("\n");

    const prompt = `Você é um especialista em motion design e animação para flyers de eventos musicais e shows.

Analise as seguintes camadas de um arquivo PSD de flyer (dimensões do documento: ${documentWidth}x${documentHeight}px):

${layersList}

Para CADA camada, sugira a melhor animação de entrada com base:
1. No NOME da camada (ex: "fundo", "titulo", "artista", "logo", "data", "cta")
2. Na POSIÇÃO da camada (camadas no topo visualmente = alta posição Y = aparecem primeiro)
3. No TAMANHO relativo (camadas maiores = mais importantes)
4. Na ORDEM na pilha (ordem 0 = mais abaixo = fundo)

Responda APENAS com um JSON válido no seguinte formato (sem markdown, sem texto extra):
{
  "suggestions": [
    {
      "layerId": "id_da_camada",
      "layerName": "nome_da_camada",
      "animation": {
        "type": "fade-in|slide-up|slide-down|slide-left|slide-right|zoom-in|zoom-out|bounce-in|rotate-in|blur-in|scale-pulse|none",
        "delay": 0,
        "duration": 800,
        "easing": "ease-out|ease-in|ease-in-out|linear|bounce|spring",
        "hold": true,
        "loop": false
      },
      "reasoning": "Breve explicação em português do porquê desta animação"
    }
  ],
  "overallStyle": "Descrição geral do estilo de animação escolhido para o flyer"
}

Regras:
- delay em milissegundos (0 a 3000ms)
- duration em milissegundos (300 a 2000ms)
- Camadas de fundo: fade-in lento (duration 1500ms, delay 0)
- Títulos principais: slide-up ou zoom-in (duration 800ms, delay 300-500ms)
- Fotos de artista: zoom-in leve (duration 1200ms, delay 200ms)
- Logos: fade-in (duration 600ms, delay alto ~1200ms)
- CTAs e ingressos: bounce-in (duration 500ms, delay 1500ms+)
- Elementos decorativos: fade-in rápido (duration 400ms)
- scale-pulse apenas para elementos que devem piscar em loop (como CTAs urgentes)`;

    const response = await genai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text ?? "";

    // limpa possível markdown ao redor do JSON
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: GeminiAnalysisResponse;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Resposta inválida do Gemini:", text);
      return NextResponse.json(
        { error: "Gemini retornou resposta inválida. Tente novamente." },
        { status: 500 }
      );
    }

    // garante que os IDs e campos obrigatórios existam
    const validated: GeminiAnalysisResponse = {
      overallStyle: parsed.overallStyle ?? "Animação progressiva e dinâmica",
      suggestions: (parsed.suggestions ?? []).map((s: LayerSuggestion) => ({
        layerId: s.layerId,
        layerName: s.layerName,
        reasoning: s.reasoning ?? "",
        animation: {
          type: s.animation?.type ?? "fade-in",
          delay: Number(s.animation?.delay ?? 0),
          duration: Number(s.animation?.duration ?? 800),
          easing: s.animation?.easing ?? "ease-out",
          hold: s.animation?.hold ?? true,
          loop: s.animation?.loop ?? false,
        } as AnimationConfig,
      })),
    };

    return NextResponse.json(validated);
  } catch (error) {
    console.error("Erro na API analyze-layers:", error);
    return NextResponse.json(
      { error: "Erro interno ao analisar camadas." },
      { status: 500 }
    );
  }
}
