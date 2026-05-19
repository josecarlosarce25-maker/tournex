import Link from "next/link";
import { Logo, Wordmark } from "@/components/ui/logo";
import { PricingSection } from "@/components/landing/pricing-section";

const FEATURES = [
  {
    icon: "🏆",
    title: "4 formatos de torneo",
    body: "Americano, eliminación directa, grupos + eliminación y liga semanal. Tú eliges, Tournex arma todo.",
  },
  {
    icon: "⚡",
    title: "Brackets y horarios automáticos",
    body: "Genera el cuadro completo, asigna canchas y horas, y respeta tus tiempos muertos. En segundos.",
  },
  {
    icon: "🔗",
    title: "Links para compartir",
    body: "Un link de inscripción y otro de resultados. Los mandas por WhatsApp y listo — sin apps que instalar.",
  },
  {
    icon: "📲",
    title: "Resultados en vivo",
    body: "Capturas el marcador y los jugadores lo ven al instante en su teléfono. Sin refrescar nada.",
  },
  {
    icon: "👥",
    title: "Inscripción sola",
    body: "Las parejas se inscriben desde el link. Tú solo ves la lista llenarse y el cupo avanzar.",
  },
  {
    icon: "📇",
    title: "Tu base de jugadores",
    body: "Cada jugador que se inscribe queda guardado. Tu siguiente torneo empieza con la lista lista.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Crea el torneo",
    body: "Un asistente de 3 pasos: nombre y fecha, formato y categorías, canchas y horarios.",
  },
  {
    n: "2",
    title: "Comparte el link",
    body: "Mandas el link de inscripción por WhatsApp. Las parejas se registran solas.",
  },
  {
    n: "3",
    title: "Juega y captura",
    body: "Generas los brackets, capturas resultados y todos siguen el torneo en vivo.",
  },
];

const AI_EXAMPLES = [
  "Pasa a Pérez/Gómez a Varonil 2da",
  "Anota 6-4 en la cancha 2",
  "¿Quién va líder en Mixto?",
  "Regenera los brackets de 1ra",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-hair bg-bg/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-soft px-4 py-2 text-sm font-semibold text-tx2 transition-colors hover:text-tx"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="rounded-soft bg-gradient-to-b from-lime2 to-lime px-4 py-2 text-sm font-semibold text-bg shadow-[0_2px_12px_-2px_rgba(173,255,47,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_24px_-2px_rgba(173,255,47,0.55)]"
            >
              Crear torneo
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-lime/20 bg-lime/8 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-lime">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          Pádel · Tenis · y más
        </span>
        <h1 className="mx-auto mt-7 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-[68px]">
          Organiza tu torneo
          <br />
          en <span className="text-gradient-lime">5 minutos</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-tx2">
          Tournex arma los brackets, los horarios y las canchas por ti. Tú
          comparte un link y deja que las parejas se inscriban solas.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-soft bg-gradient-to-b from-lime2 to-lime px-7 py-3.5 text-base font-semibold text-bg shadow-[0_4px_24px_-4px_rgba(173,255,47,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_36px_-6px_rgba(173,255,47,0.65)]"
          >
            Crear mi primer torneo →
          </Link>
          <a
            href="#como-funciona"
            className="rounded-soft border border-br2 bg-bg2/60 px-7 py-3.5 text-base font-semibold text-tx transition-colors hover:border-tx3"
          >
            Ver cómo funciona
          </a>
        </div>

        {/* Floating preview hint */}
        <div className="mx-auto mt-16 max-w-3xl">
          <div className="surface rounded-xl p-1.5">
            <div className="rounded-[14px] bg-bg3 px-6 py-10 ring-1 ring-hair">
              <div className="grid grid-cols-3 gap-3">
                {["🏆 12 parejas", "🟢 En vivo", "📊 Cuartos"].map((t) => (
                  <div
                    key={t}
                    className="surface rounded-soft px-3 py-4 text-sm font-semibold text-tx2"
                  >
                    {t}
                  </div>
                ))}
              </div>
              <p className="mt-5 font-mono text-xs text-tx3">
                tournex.app/t/copa-verano-2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="surface surface-hover rounded-card p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-soft bg-bg3 text-2xl ring-1 ring-hair">
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-tx2">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-4xl font-bold tracking-tight">
          Tres pasos. Cero hojas de cálculo.
        </h2>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="surface rounded-card p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime/12 font-mono text-lg font-bold text-lime ring-1 ring-inset ring-lime/20">
                {s.n}
              </div>
              <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-tx2">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI assistant — coming soon */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="surface glow relative overflow-hidden rounded-xl p-10 md:p-14">
          {/* Decorative gradient blob */}
          <div className="pointer-events-none absolute -top-32 -right-20 h-72 w-72 rounded-full bg-lime/20 blur-3xl" />
          <div className="relative grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/8 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-lime">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />
                Próximamente · Preventa abierta
              </span>
              <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                Habla con Tournex.{" "}
                <span className="text-gradient-lime">Tournex hace.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-tx2">
                Un asistente con IA dentro de la app. Le hablas en español
                normal y ejecuta los cambios por ti: mover parejas de categoría,
                regenerar brackets, capturar marcadores, responderte quién va
                líder. Sin clicks, sin formularios.
              </p>
              <p className="mt-4 rounded-soft border border-lime/20 bg-lime/[0.04] px-4 py-3 text-sm text-tx">
                🎁 <strong className="text-lime">Acceso anticipado gratis</strong> incluido en los planes
                Pro y Club para quienes se suscriban antes del lanzamiento.
              </p>
            </div>

            {/* Mock chat preview */}
            <div className="surface rounded-card p-1.5">
              <div className="rounded-[10px] bg-bg p-5 ring-1 ring-hair">
                <div className="space-y-2.5">
                  {AI_EXAMPLES.map((ex, i) => (
                    <div
                      key={ex}
                      className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          i % 2 === 0
                            ? "bg-bg3 text-tx ring-1 ring-hair"
                            : "bg-lime/10 text-lime ring-1 ring-inset ring-lime/25"
                        }`}
                      >
                        {i % 2 === 0 ? ex : "✓ Listo."}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-soft border border-br2 bg-bg2 px-3 py-2.5">
                  <span className="text-tx3">💬</span>
                  <span className="flex-1 text-sm text-tx3">
                    Escribe a tu asistente…
                  </span>
                  <span className="font-mono text-[10px] text-tx3">⏎</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing — client component with monthly/annual toggle */}
      <PricingSection />

      {/* Footer CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="surface mx-auto max-w-2xl rounded-xl px-8 py-14">
          <div className="flex justify-center">
            <Logo size={52} />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            ¿Listo para tu próximo torneo?
          </h2>
          <p className="mt-3 text-tx2">
            Crea tu cuenta gratis. No necesitas tarjeta.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-soft bg-gradient-to-b from-lime2 to-lime px-7 py-3.5 text-base font-semibold text-bg shadow-[0_4px_24px_-4px_rgba(173,255,47,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_36px_-6px_rgba(173,255,47,0.65)]"
          >
            Empezar ahora →
          </Link>
        </div>
      </section>

      <footer className="border-t border-hair">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-tx3 sm:flex-row">
          <Wordmark size={24} />
          <span>
            © {new Date().getFullYear()} Tournex · Guadalajara, México
          </span>
        </div>
      </footer>
    </div>
  );
}
