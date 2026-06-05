// Tournex AI assistant — shared logic between the API route and the client.
//
// Design: the API route builds a compact text snapshot of the tournament
// (pairs + pending matches + standings, all with IDs) and puts it in the
// system prompt, so the model can answer questions directly. For *changes*
// it calls tools; the API returns those tool calls to the client, which
// executes them with the existing data-layer (store) so all the bracket
// advancement / validation logic is reused.

import type { Tournament, Match } from "@/lib/types";
import { isPlaceholder } from "@/lib/types";
import { standings } from "@/lib/tournament/standings";

export interface FlatMatch {
  id: string;
  category: string;
  roundName: string;
  team1: string;
  team2: string;
  team1Id: string | null;
  team2Id: string | null;
  status: string;
  score?: string;
}

/** Flattens every match across brackets / groups into a single list. */
export function flattenMatches(t: Tournament): FlatMatch[] {
  const out: FlatMatch[] = [];
  const pushRound = (
    category: string,
    roundName: string,
    matches: Match[],
  ) => {
    for (const m of matches) {
      const t1 = m.team1;
      const t2 = m.team2;
      out.push({
        id: m.id,
        category,
        roundName,
        team1: t1?.name ?? "—",
        team2: t2?.name ?? "—",
        team1Id: t1 && !isPlaceholder(t1) ? t1.id : null,
        team2Id: t2 && !isPlaceholder(t2) ? t2.id : null,
        status: m.status,
        score:
          m.sets && m.sets.length
            ? m.sets.map((s) => `${s.s1}-${s.s2}`).join(", ")
            : undefined,
      });
    }
  };

  for (const b of t.brackets ?? []) {
    for (const r of b.rounds) pushRound(b.category, r.name ?? `Ronda`, r.matches);
    for (const r of b.consolationRounds ?? [])
      pushRound(b.category, `Consolación ${r.name ?? ""}`, r.matches);
  }
  for (const g of t.groups ?? []) {
    for (const r of g.rounds)
      pushRound(g.category, `${g.name} · ${r.name ?? "Ronda"}`, r.matches);
  }
  for (const j of t.jornadas ?? []) {
    for (const court of j.courts) {
      pushRound("Liga", `Jornada ${j.number} · ${court.name}`, court.matches);
    }
  }
  return out;
}

/** Builds the compact context string injected into the system prompt. */
export function buildContext(t: Tournament): string {
  const lines: string[] = [];
  lines.push(`TORNEO: ${t.name}`);
  lines.push(`Deporte: ${t.sport} · Formato: ${t.format} · Estado: ${t.status}`);
  lines.push(`Formato de marcador: ${t.scoreFormat}`);

  const teams = t.teams ?? [];
  lines.push(`\nPAREJAS (${teams.length}):`);
  for (const tm of teams) {
    lines.push(
      `- id=${tm.id} | ${tm.name} | categoría: ${tm.category} | estado: ${tm.status}`,
    );
  }

  const matches = flattenMatches(t);
  const pending = matches.filter((m) => m.status !== "done");
  const played = matches.filter((m) => m.status === "done");

  if (pending.length) {
    lines.push(`\nPARTIDOS PENDIENTES (${pending.length}):`);
    for (const m of pending) {
      lines.push(
        `- id=${m.id} | ${m.category} · ${m.roundName} | ${m.team1} vs ${m.team2}`,
      );
    }
  }
  if (played.length) {
    lines.push(`\nPARTIDOS JUGADOS (${played.length}):`);
    for (const m of played) {
      lines.push(
        `- id=${m.id} | ${m.category} · ${m.roundName} | ${m.team1} ${m.score ?? ""} ${m.team2}`,
      );
    }
  }

  // Standings for round-robin / group formats.
  try {
    for (const b of t.brackets ?? []) {
      if (b.format === "round_robin") {
        const rows = standings(
          teams.filter((tm) => tm.category === b.category),
          b.rounds,
        );
        if (rows.length) {
          lines.push(`\nTABLA (${b.category}):`);
          rows.forEach((r, i) =>
            lines.push(
              `${i + 1}. ${r.team.name} — PJ ${r.played} G ${r.won} P ${r.lost} | pts ${r.points}`,
            ),
          );
        }
      }
    }
  } catch {
    // standings are best-effort; never block the assistant on them
  }

  return lines.join("\n");
}

export const SYSTEM_PROMPT = `Eres el asistente de Tournex, una plataforma de torneos de pádel. Ayudas al ORGANIZADOR a gestionar su torneo hablando en español mexicano, de forma breve y clara.

Tienes el estado completo del torneo abajo (parejas, partidos y tabla, todos con su id). Úsalo para responder preguntas directamente.

Para HACER CAMBIOS usa las herramientas (tools). Reglas:
- Para anotar un marcador, usa "anotar_marcador" con el id del partido y los sets. Cada set es {local, visitante} con los games de cada equipo (team1=local, team2=visitante del partido).
- Para corregir el nombre/teléfono/categoría de una pareja, usa "editar_pareja" con su id.
- Si te piden algo ambiguo (ej. "anota el partido de Pérez" pero hay varios), pregunta cuál antes de actuar.
- Nunca inventes ids. Usa solo los que aparecen en el contexto.
- Cuando ejecutes una acción, confírmala en una frase corta.

Sé conciso. No expliques de más. Responde como un asistente experto en torneos.`;

// OpenAI tool/function definitions.
export const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "anotar_marcador",
      description:
        "Anota o corrige el marcador de un partido. team1 es el local y team2 el visitante (según aparecen en el contexto).",
      parameters: {
        type: "object",
        properties: {
          partido_id: {
            type: "string",
            description: "El id exacto del partido (campo id= del contexto).",
          },
          sets: {
            type: "array",
            description:
              "Lista de sets. Cada set tiene los games del equipo local y visitante.",
            items: {
              type: "object",
              properties: {
                local: { type: "number", description: "Games del equipo 1 (local)" },
                visitante: {
                  type: "number",
                  description: "Games del equipo 2 (visitante)",
                },
              },
              required: ["local", "visitante"],
            },
          },
        },
        required: ["partido_id", "sets"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "editar_pareja",
      description:
        "Corrige los datos de una pareja ya registrada (nombres, teléfonos o categoría).",
      parameters: {
        type: "object",
        properties: {
          pareja_id: {
            type: "string",
            description: "El id exacto de la pareja (campo id= del contexto).",
          },
          jugador1: { type: "string", description: "Nuevo nombre del jugador 1" },
          jugador2: { type: "string", description: "Nuevo nombre del jugador 2" },
          telefono1: { type: "string", description: "Nuevo WhatsApp del jugador 1" },
          telefono2: { type: "string", description: "Nuevo WhatsApp del jugador 2" },
          categoria: { type: "string", description: "Nueva categoría" },
        },
        required: ["pareja_id"],
      },
    },
  },
] as const;

// The action shape the API returns to the client to execute via the store.
export type AssistantAction =
  | {
      kind: "anotar_marcador";
      partido_id: string;
      sets: { s1: number; s2: number }[];
    }
  | {
      kind: "editar_pareja";
      pareja_id: string;
      patch: {
        player1Name?: string;
        player2Name?: string;
        player1Phone?: string;
        player2Phone?: string;
        category?: string;
      };
    };
