// Floating AI assistant chat for the tournament detail screen.
// Sends the tournament context + history to /api/assistant, then executes
// any returned actions with the data layer (so validation/RLS apply).
"use client";

import { useState, useRef, useEffect } from "react";
import { store } from "@/lib/data/use-store";
import { buildContext, type AssistantAction } from "@/lib/ai/assistant";
import type { Tournament } from "@/lib/types";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "¿Quién va líder?",
  "¿Qué partidos faltan?",
  "Anota 6-4 6-3 en…",
];

export function AssistantChat({ tournament }: { tournament: Tournament }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente. Pídeme anotar marcadores, corregir parejas o consultar la tabla. Ej: «anota 6-4 6-2 en el partido de Pérez».",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  async function runActions(actions: AssistantAction[]): Promise<string[]> {
    const notes: string[] = [];
    for (const a of actions) {
      if (a.kind === "anotar_marcador") {
        const r = await store.saveScore(tournament.id, a.partido_id, a.sets);
        notes.push(
          r.ok
            ? "✓ Marcador anotado"
            : `✗ No pude anotar: ${r.error ?? "error"}`,
        );
      } else if (a.kind === "editar_pareja") {
        const r = await store.updateTeam(
          tournament.id,
          a.pareja_id,
          a.patch,
        );
        notes.push(
          r.ok ? "✓ Pareja actualizada" : `✗ No pude editar: ${r.error ?? "error"}`,
        );
      }
    }
    return notes;
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: buildContext(tournament),
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              data.error === "El asistente IA aún no está configurado."
                ? "El asistente todavía no está activo. Avísale a Tournex para encenderlo."
                : (data.error ?? "Hubo un error. Intenta de nuevo."),
          },
        ]);
        setBusy(false);
        return;
      }

      let reply: string = data.reply ?? "";
      if (Array.isArray(data.actions) && data.actions.length) {
        const notes = await runActions(data.actions);
        if (notes.length) reply += "\n" + notes.join("\n");
      }
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Error de conexión. Intenta de nuevo." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-lime2 to-lime text-2xl shadow-[0_8px_30px_-4px_rgba(173,255,47,0.6)] transition-transform hover:scale-105 active:scale-95"
          aria-label="Abrir asistente IA"
        >
          🤖
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[560px] max-h-[80vh] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-card border border-hair bg-bg2 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-hair bg-bg3/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <div className="text-sm font-bold">Asistente Tournex</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-lime">
                  IA · {tournament.name.slice(0, 24)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-soft px-2 py-1 text-tx3 transition-colors hover:bg-bg3 hover:text-tx"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-lime/15 text-tx ring-1 ring-inset ring-lime/25"
                      : "bg-bg3 text-tx2"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-bg3 px-3.5 py-2 text-[13px] text-tx3">
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse [animation-delay:0.2s]">●</span>
                    <span className="animate-pulse [animation-delay:0.4s]">●</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions (only before the first user message) */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-hair bg-bg3 px-2.5 py-1 text-[11px] text-tx2 transition-colors hover:border-lime/40 hover:text-tx"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-hair p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe una orden…"
              disabled={busy}
              className="flex-1 rounded-soft border border-br2 bg-bg px-3 py-2 text-sm text-tx outline-none transition-colors focus:border-lime/40 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-soft bg-gradient-to-b from-lime2 to-lime text-bg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
              aria-label="Enviar"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
