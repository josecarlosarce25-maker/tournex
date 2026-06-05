// POST /api/assistant
// The Tournex AI assistant. Receives the tournament context + chat history,
// calls OpenAI with function-calling, and returns a reply plus any actions
// for the client to execute with the data layer (so all bracket/validation
// logic is reused and RLS still applies).

import { NextResponse, type NextRequest } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import {
  SYSTEM_PROMPT,
  TOOLS,
  type AssistantAction,
} from "@/lib/ai/assistant";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "El asistente IA aún no está configurado." },
      { status: 503 },
    );
  }

  // Must be signed in.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const context: string = typeof body.context === "string" ? body.context : "";
  const messages: ChatMessage[] = Array.isArray(body.messages)
    ? body.messages.slice(-12)
    : [];

  if (!context || messages.length === 0) {
    return NextResponse.json(
      { error: "Falta contexto o mensaje." },
      { status: 400 },
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 600,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: `ESTADO ACTUAL DEL TORNEO:\n${context}` },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      tools: TOOLS as never,
      tool_choice: "auto",
    });

    const choice = completion.choices[0]?.message;
    const actions: AssistantAction[] = [];

    for (const call of choice?.tool_calls ?? []) {
      if (call.type !== "function") continue;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        continue;
      }

      if (call.function.name === "anotar_marcador") {
        const sets = Array.isArray(args.sets)
          ? (args.sets as { local: number; visitante: number }[]).map((s) => ({
              s1: Number(s.local),
              s2: Number(s.visitante),
            }))
          : [];
        if (typeof args.partido_id === "string" && sets.length) {
          actions.push({
            kind: "anotar_marcador",
            partido_id: args.partido_id,
            sets,
          });
        }
      } else if (call.function.name === "editar_pareja") {
        if (typeof args.pareja_id === "string") {
          actions.push({
            kind: "editar_pareja",
            pareja_id: args.pareja_id,
            patch: {
              player1Name:
                typeof args.jugador1 === "string" ? args.jugador1 : undefined,
              player2Name:
                typeof args.jugador2 === "string" ? args.jugador2 : undefined,
              player1Phone:
                typeof args.telefono1 === "string" ? args.telefono1 : undefined,
              player2Phone:
                typeof args.telefono2 === "string" ? args.telefono2 : undefined,
              category:
                typeof args.categoria === "string" ? args.categoria : undefined,
            },
          });
        }
      }
    }

    // If the model only made tool calls with no prose, synthesize a short reply.
    const reply =
      choice?.content?.trim() ||
      (actions.length
        ? "Listo, apliqué el cambio."
        : "¿En qué te ayudo con tu torneo?");

    return NextResponse.json({ reply, actions });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error con la IA";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
