// Public registration form — /reg/[slug]. No login required.
"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import {
  Card,
  Button,
  Input,
  Select,
  Field,
  ProgressBar,
} from "@/components/ui/primitives";
import { PublicShell, NotFoundCard } from "./public-shell";
import { store } from "@/lib/data/use-store";
import type { Tournament } from "@/lib/types";

const SHIRT_SIZES = ["", "XS", "S", "M", "L", "XL", "XXL"];

export function Registration({ slug }: { slug: string }) {
  const [tournament, setTournament] = useState<Tournament | null | undefined>(
    undefined,
  );
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    player1Name: "",
    player1Phone: "",
    player1Email: "",
    player1ShirtSize: "",
    player2Name: "",
    player2Phone: "",
    player2Email: "",
    player2ShirtSize: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    store.getTournamentBySlug(slug).then((t) => {
      if (cancelled) return;
      setTournament(t);
      if (t) setForm((f) => ({ ...f, category: t.categories[0] ?? "General" }));
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (tournament === undefined) {
    return (
      <PublicShell>
        <p className="text-center text-tx3">Cargando…</p>
      </PublicShell>
    );
  }
  if (tournament === null) {
    return (
      <PublicShell>
        <NotFoundCard />
      </PublicShell>
    );
  }

  const t = tournament;
  const teamCount = t.teams?.length ?? 0;
  const cupoFull = t.maxPairs ? teamCount >= t.maxPairs : false;
  const pastDeadline = t.deadline
    ? new Date(t.deadline) < new Date(new Date().toDateString())
    : false;
  const closed = cupoFull || pastDeadline || t.status === "done";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await store.addTeam(t.id, form);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo completar la inscripción.");
      return;
    }
    setDone(true);
  }

  const setF = (p: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...p }));

  return (
    <PublicShell>
      {/* Tournament header */}
      <div className="mb-6 text-center">
        <div className="flex justify-center">
          <Logo size={40} />
        </div>
        <h1 className="mt-3 text-2xl font-bold">{t.name}</h1>
        <p className="mt-1 text-sm text-tx3">
          {t.sport} · {t.location ?? ""} · {t.date ?? ""}
        </p>
        {t.price ? (
          <p className="mt-2 text-sm text-tx2">
            Inscripción:{" "}
            <span className="font-semibold text-lime">${t.price} MXN</span>
          </p>
        ) : null}
      </div>

      {t.maxPairs ? (
        <div className="mb-6">
          <div className="mb-1.5 flex justify-between text-[13px]">
            <span className="text-tx2">
              {teamCount} de {t.maxPairs} parejas inscritas
            </span>
            <span className="font-semibold text-lime">
              {Math.round((teamCount / t.maxPairs) * 100)}%
            </span>
          </div>
          <ProgressBar pct={(teamCount / t.maxPairs) * 100} />
        </div>
      ) : null}

      {done ? (
        <Card className="p-8 text-center">
          <div className="text-5xl">✅</div>
          <h2 className="mt-3 text-xl font-bold">¡Inscripción recibida!</h2>
          <p className="mt-2 text-sm text-tx2">
            {form.player1Name}
            {form.player2Name ? ` y ${form.player2Name}` : ""} — categoría{" "}
            <span className="text-lime">{form.category}</span>.
          </p>
          <p className="mt-2 text-sm text-tx3">
            El organizador ya puede ver tu registro.
          </p>
          {t.payLink && (
            <a href={t.payLink} target="_blank" rel="noopener noreferrer">
              <Button className="mt-5">💳 Pagar inscripción</Button>
            </a>
          )}
        </Card>
      ) : closed ? (
        <Card className="p-8 text-center">
          <div className="text-5xl">🔒</div>
          <h2 className="mt-3 text-xl font-bold">Inscripciones cerradas</h2>
          <p className="mt-2 text-sm text-tx3">
            {cupoFull
              ? "Se llenó el cupo de parejas."
              : pastDeadline
                ? "Pasó la fecha límite de inscripción."
                : "Este torneo ya terminó."}
          </p>
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="mb-4 text-base font-bold">Inscribe a tu pareja</h2>
          <form onSubmit={submit}>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Jugador 1 *">
                <Input
                  value={form.player1Name}
                  onChange={(e) => setF({ player1Name: e.target.value })}
                  placeholder="Nombre completo"
                  required
                />
              </Field>
              <Field label="WhatsApp J1">
                <Input
                  value={form.player1Phone}
                  onChange={(e) => setF({ player1Phone: e.target.value })}
                  placeholder="33 1234 5678"
                />
              </Field>
              <Field label="Email J1">
                <Input
                  type="email"
                  value={form.player1Email}
                  onChange={(e) => setF({ player1Email: e.target.value })}
                  placeholder="correo@email.com"
                />
              </Field>
              {t.includesShirt && (
                <Field label="Talla J1">
                  <Select
                    value={form.player1ShirtSize}
                    onChange={(e) =>
                      setF({ player1ShirtSize: e.target.value })
                    }
                  >
                    {SHIRT_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s || "—"}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              <Field label="Jugador 2">
                <Input
                  value={form.player2Name}
                  onChange={(e) => setF({ player2Name: e.target.value })}
                  placeholder="Nombre completo"
                />
              </Field>
              <Field label="WhatsApp J2">
                <Input
                  value={form.player2Phone}
                  onChange={(e) => setF({ player2Phone: e.target.value })}
                  placeholder="33 1234 5678"
                />
              </Field>
              <Field label="Email J2">
                <Input
                  type="email"
                  value={form.player2Email}
                  onChange={(e) => setF({ player2Email: e.target.value })}
                  placeholder="correo@email.com"
                />
              </Field>
              {t.includesShirt && (
                <Field label="Talla J2">
                  <Select
                    value={form.player2ShirtSize}
                    onChange={(e) =>
                      setF({ player2ShirtSize: e.target.value })
                    }
                  >
                    {SHIRT_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s || "—"}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>
            <Field label="Categoría">
              <Select
                value={form.category}
                onChange={(e) => setF({ category: e.target.value })}
              >
                {t.categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>

            {error && (
              <p className="mb-3 rounded-soft bg-red/10 px-3 py-2 text-[13px] text-red">
                {error}
              </p>
            )}

            <Button type="submit" full disabled={submitting}>
              {submitting ? "Enviando…" : "Inscribirme →"}
            </Button>
            {t.payLink && (
              <p className="mt-3 text-center text-[12px] text-tx3">
                Después de inscribirte podrás pagar tu lugar.
              </p>
            )}
          </form>
        </Card>
      )}
    </PublicShell>
  );
}
