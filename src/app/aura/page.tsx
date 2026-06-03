import type { Metadata } from "next";
import { AuraMark, AuraWordmark } from "@/components/aura/logo";

export const metadata: Metadata = {
  title: "AURA — Revelando el poder del agua",
  description:
    "Tu aura, tu energía, tu agua. AURA es agua pura, equilibrada y esencial. Lanzamiento muy pronto.",
};

/* ── Contenido ───────────────────────────────────────────────── */

const PILARES = [
  {
    k: "Pura",
    body: "Agua limpia, sin azúcar y sin excesos. Solo lo que tu cuerpo necesita.",
    icon: "drop",
  },
  {
    k: "Equilibrada",
    body: "Minerales y electrolitos en su justa medida para mantenerte estable.",
    icon: "balance",
  },
  {
    k: "Esencial",
    body: "Parte de tu día, de tu energía y de tu ritual de bienestar.",
    icon: "peak",
  },
] as const;

const BENEFICIOS = [
  {
    tag: "Mente",
    title: "Equilibrio diario",
    body: "Hidratación constante que sostiene tu calma y tu enfoque a lo largo del día.",
  },
  {
    tag: "Foco",
    title: "Concentración clara",
    body: "Menos azúcar, más claridad. Tu cabeza despejada para rendir cuando importa.",
  },
  {
    tag: "Cuerpo",
    title: "Rendimiento natural",
    body: "Repón lo que pierdes y muévete con energía real, sin estimulantes artificiales.",
  },
];

// Las 3 piezas de la campaña.
// Los .svg son placeholders on-brand. Para usar tus fotos reales, deja los
// archivos en /public/aura/ (p. ej. promo-countdown.png) y cambia la extensión aquí.
const CAMPANA = [
  {
    src: "/aura/promo-countdown.svg",
    alt: "AURA — Faltan 5 días para tu despertar",
    titulo: "Cuenta regresiva",
    pie: "Tu aura, tu energía, tu agua.",
  },
  {
    src: "/aura/promo-benefits.svg",
    alt: "Tu momento, tu AURA — equilibrio, concentración y rendimiento",
    titulo: "Tu momento, tu AURA",
    pie: "Más agua, más vida, más AURA.",
  },
  {
    src: "/aura/promo-launch.svg",
    alt: "AURA — Revelando el poder del agua. Lanzamiento muy pronto.",
    titulo: "Revelando el poder del agua",
    pie: "Lanzamiento muy pronto.",
  },
];

/* ── Página ──────────────────────────────────────────────────── */

export default function AuraPage() {
  return (
    <div className="aura-root min-h-screen bg-[#06100e] text-[#eef3f1] antialiased">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#06100e]/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <AuraWordmark />
          <div className="hidden items-center gap-8 text-sm text-[#9fb3ad] md:flex">
            <a href="#beneficios" className="transition-colors hover:text-white">
              Beneficios
            </a>
            <a href="#campana" className="transition-colors hover:text-white">
              Campaña
            </a>
            <a href="#lanzamiento" className="transition-colors hover:text-white">
              Lanzamiento
            </a>
          </div>
          <a
            href="#lanzamiento"
            className="rounded-full bg-gradient-to-b from-[#3fe0c4] to-[#1fb89c] px-5 py-2 text-sm font-semibold text-[#04120f] shadow-[0_2px_18px_-4px_rgba(63,224,196,0.5)] transition-all hover:-translate-y-0.5"
          >
            Notifícame
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[#1fb89c]/16 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-[#c9a84c]/10 blur-[100px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-20 md:grid-cols-[1.1fr_0.9fr] md:pt-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#3fe0c4]/25 bg-[#3fe0c4]/[0.07] px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#5fe6cd]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3fe0c4]" />
              Faltan 5 días para tu despertar
            </span>

            <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Revelando el
              <br />
              <span className="bg-gradient-to-r from-[#e8cf86] via-[#d4b65e] to-[#c9a84c] bg-clip-text text-transparent">
                poder del agua
              </span>
            </h1>

            <p className="mt-6 max-w-md text-lg text-[#9fb3ad]">
              Tu aura, tu energía, tu agua. AURA es hidratación pura,
              equilibrada y esencial — pensada para acompañar tu día y tu
              bienestar.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#lanzamiento"
                className="rounded-full bg-gradient-to-b from-[#3fe0c4] to-[#1fb89c] px-7 py-3.5 text-base font-semibold text-[#04120f] shadow-[0_4px_28px_-6px_rgba(63,224,196,0.55)] transition-all hover:-translate-y-0.5"
              >
                Quiero la mía →
              </a>
              <a
                href="#beneficios"
                className="rounded-full border border-white/12 bg-white/[0.03] px-7 py-3.5 text-base font-semibold text-[#eef3f1] transition-colors hover:border-white/25"
              >
                Conocer AURA
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-xs uppercase tracking-widest text-[#7b8f89]">
              <Stat icon="clock" label="Tiempo" />
              <span className="h-4 w-px bg-white/10" />
              <Stat icon="battery" label="Energía" />
              <span className="h-4 w-px bg-white/10" />
              <Stat icon="lotus" label="Equilibrio" />
            </div>
          </div>

          {/* Bottle visual */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 m-auto h-72 w-72 rounded-full bg-[#c9a84c]/12 blur-3xl" />
            <Bottle />
          </div>
        </div>
      </section>

      {/* Pilares: Pura · Equilibrada · Esencial */}
      <section className="border-y border-white/[0.06] bg-[#04100d]">
        <div className="mx-auto grid max-w-6xl gap-px px-6 py-2 sm:grid-cols-3">
          {PILARES.map((p) => (
            <div key={p.k} className="flex items-start gap-4 px-2 py-7">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#3fe0c4]/20 bg-[#3fe0c4]/[0.06] text-[#5fe6cd]">
                <Glyph name={p.icon} />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-wide text-white">
                  {p.k}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[#9fb3ad]">
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Beneficios — Tu momento, tu AURA */}
      <section id="beneficios" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#5fe6cd]">
            Tu momento, tu AURA
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Y tú, ¿cómo despiertas tu aura?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#9fb3ad]">
            Hidratarte bien cambia tu día. Estos son los momentos en los que
            AURA hace la diferencia.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {BENEFICIOS.map((b) => (
            <article
              key={b.title}
              className="group rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-7 transition-all hover:-translate-y-1 hover:border-[#3fe0c4]/30"
            >
              <span className="inline-flex rounded-full border border-[#3fe0c4]/25 bg-[#3fe0c4]/[0.07] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#5fe6cd]">
                {b.tag}
              </span>
              <h3 className="mt-5 text-xl font-bold text-white">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9fb3ad]">
                {b.body}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-lg font-semibold tracking-wide text-[#d4b65e]">
          Más agua, más vida, más AURA. ✦
        </p>
      </section>

      {/* Campaña — galería de las 3 imágenes (reemplaza "¿Para quién es AURA?") */}
      <section
        id="campana"
        className="border-y border-white/[0.06] bg-[#04100d] py-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#5fe6cd]">
              La campaña
            </span>
            <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
              Tu aura, tu energía, tu agua
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[#9fb3ad]">
              Tres piezas para el despertar de AURA. La cuenta regresiva ya
              empezó.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CAMPANA.map((c, i) => (
              <figure
                key={c.titulo + i}
                className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#081915] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.src}
                    alt={c.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-white">{c.titulo}</p>
                    <p className="text-xs text-[#9fb3ad]">{c.pie}</p>
                  </div>
                  <AuraMark size={24} />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Lanzamiento — CTA */}
      <section id="lanzamiento" className="mx-auto max-w-6xl px-6 py-28">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#0a1a16] to-[#06100e] px-8 py-16 text-center md:px-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-[#1fb89c]/16 blur-[110px]" />
          <div className="relative">
            <div className="flex justify-center">
              <AuraMark size={56} />
            </div>
            <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Lanzamiento{" "}
              <span className="italic text-[#d4b65e]">muy pronto</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[#9fb3ad]">
              Déjanos tu correo y serás de los primeros en despertar tu aura
              cuando lancemos.
            </p>

            <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                placeholder="tucorreo@ejemplo.com"
                className="flex-1 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3.5 text-sm text-white placeholder:text-[#6f817b] focus:border-[#3fe0c4]/50 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-b from-[#3fe0c4] to-[#1fb89c] px-7 py-3.5 text-sm font-semibold text-[#04120f] shadow-[0_4px_24px_-6px_rgba(63,224,196,0.55)] transition-all hover:-translate-y-0.5"
              >
                Avísenme
              </button>
            </form>

            <div className="mt-10 flex items-center justify-center gap-8 text-xs uppercase tracking-[0.2em] text-[#7b8f89]">
              <span>Pura</span>
              <span className="text-[#3fe0c4]">•</span>
              <span>Equilibrada</span>
              <span className="text-[#3fe0c4]">•</span>
              <span>Esencial</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-[#7b8f89] sm:flex-row">
          <AuraWordmark size={26} />
          <span>
            © {new Date().getFullYear()} AURA · Tu aura, tu energía, tu agua
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ── Piezas visuales ─────────────────────────────────────────── */

function Stat({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <Glyph name={icon} size={18} />
      {label}
    </span>
  );
}

function Bottle() {
  return (
    <div className="relative flex h-[440px] w-[180px] flex-col items-center">
      {/* Cap */}
      <div className="h-12 w-16 rounded-t-2xl rounded-b-md bg-gradient-to-b from-[#1a1a1a] to-[#000]" />
      <div className="-mt-1 h-3 w-20 rounded-full bg-[#0c0c0c] ring-1 ring-white/5" />
      {/* Neck → body */}
      <div className="relative mt-1 flex w-full flex-1 flex-col items-center rounded-[44px] bg-gradient-to-b from-[#1c1c1c] via-[#0e0e0e] to-[#050505] pt-10 shadow-[inset_0_2px_20px_rgba(255,255,255,0.05),0_40px_60px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.06]">
        {/* Specular highlight */}
        <div className="pointer-events-none absolute left-6 top-8 h-56 w-3 rounded-full bg-white/10 blur-[2px]" />
        <AuraMark size={64} />
        <span className="mt-3 text-sm font-semibold tracking-[0.4em] text-[#c9a84c]">
          AURA
        </span>
        <span className="mt-auto mb-12 text-xs font-medium tracking-[0.35em] text-[#8a7a4a]">
          AURA
        </span>
      </div>
    </div>
  );
}

function Glyph({ name, size = 22 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "drop":
      return (
        <svg {...common}>
          <path d="M12 3c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9Z" />
        </svg>
      );
    case "balance":
      return (
        <svg {...common}>
          <path d="M12 3v18M5 8h14M7 8l-3 6a3 3 0 0 0 6 0Zm10 0-3 6a3 3 0 0 0 6 0Z" />
        </svg>
      );
    case "peak":
      return (
        <svg {...common}>
          <path d="m3 20 6-11 4 6 2-3 6 8Z" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "battery":
      return (
        <svg {...common}>
          <rect x="2" y="8" width="16" height="9" rx="2" />
          <path d="M22 11v3" />
        </svg>
      );
    case "lotus":
      return (
        <svg {...common}>
          <path d="M12 13c-3 0-5-2-5-5 3 0 5 2 5 5Zm0 0c3 0 5-2 5-5-3 0-5 2-5 5Zm0 0c0-3-1-6-1-6s-1 3-1 6m-7 1c0 3 4 5 9 5s9-2 9-5" />
        </svg>
      );
    default:
      return null;
  }
}
