// Score capture widget. Renders the right number of set inputs for the
// tournament's score format, validates, and saves.
//
// The two teams are color-coded so the organizer can't accidentally swap
// which score belongs to whom: pareja 1 = blanco, pareja 2 = lima.
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { store } from "@/lib/data/use-store";
import type { ScoreFormat, SetScore } from "@/lib/types";
import { setsNeeded, isBestOfThree } from "@/lib/tournament/scoring";

export function ScoreInput({
  tournamentId,
  matchId,
  scoreFormat,
  team1Name,
  team2Name,
}: {
  tournamentId: string;
  matchId: string;
  scoreFormat: ScoreFormat;
  team1Name: string;
  team2Name: string;
}) {
  const count = setsNeeded(scoreFormat);
  const showSets = isBestOfThree(scoreFormat);
  const [sets, setSets] = useState<SetScore[]>(
    Array.from({ length: count }, () => ({ s1: 0, s2: 0 })),
  );
  const [saving, setSaving] = useState(false);

  const update = (i: number, side: "s1" | "s2", value: string) => {
    const n = value === "" ? 0 : Math.max(0, Number(value));
    setSets((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [side]: n } : s)),
    );
  };

  async function save() {
    setSaving(true);
    const result = await store.saveScore(tournamentId, matchId, sets);
    setSaving(false);
    if (result.ok) toast("Resultado guardado ✓");
    else toast(result.error ?? "No se pudo guardar", "error");
  }

  // Inputs styled per team:
  // pareja 1 → white border + white score text
  // pareja 2 → lime border + lime score text
  const inputClass = (color: "white" | "lime") =>
    [
      "w-14 rounded-md py-2 text-center font-mono text-base font-bold outline-none transition-colors",
      color === "white"
        ? "border border-white/30 bg-bg text-white focus:border-white focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]"
        : "border border-lime/50 bg-bg text-lime focus:border-lime focus:shadow-[0_0_0_3px_rgba(173,255,47,0.18)]",
    ].join(" ");

  return (
    <div className="flex flex-col gap-2">
      {/* Column header for best-of-3 */}
      {showSets && (
        <div className="flex items-center gap-2 pl-1 text-[10px] font-mono uppercase tracking-wider text-tx3">
          <span className="flex-1">Pareja</span>
          {sets.map((_, i) => (
            <span key={i} className="w-14 text-center">
              Set {i + 1}
            </span>
          ))}
        </div>
      )}

      {/* Team 1 row — white */}
      <div className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1.5 ring-1 ring-white/15">
        <span className="flex-1 truncate text-[12px] font-semibold text-white">
          {team1Name}
        </span>
        {sets.map((s, i) => (
          <input
            key={i}
            type="number"
            min={0}
            value={s.s1 || ""}
            onChange={(e) => update(i, "s1", e.target.value)}
            placeholder="—"
            aria-label={`${team1Name} set ${i + 1}`}
            className={inputClass("white")}
          />
        ))}
      </div>

      {/* Team 2 row — lime */}
      <div className="flex items-center gap-2 rounded-md bg-lime/5 px-2 py-1.5 ring-1 ring-lime/25">
        <span className="flex-1 truncate text-[12px] font-semibold text-lime">
          {team2Name}
        </span>
        {sets.map((s, i) => (
          <input
            key={i}
            type="number"
            min={0}
            value={s.s2 || ""}
            onChange={(e) => update(i, "s2", e.target.value)}
            placeholder="—"
            aria-label={`${team2Name} set ${i + 1}`}
            className={inputClass("lime")}
          />
        ))}
      </div>

      <Button size="sm" full onClick={save} disabled={saving}>
        {saving ? "Guardando…" : "✓ Guardar resultado"}
      </Button>
    </div>
  );
}
