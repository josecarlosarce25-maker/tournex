import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AURA — Revelando el poder del agua",
  description:
    "Tu aura, tu energía, tu agua. Descubre la botella AURA. Lanzamiento muy pronto.",
};

export default function AuraPage() {
  return (
    <main className="min-h-screen bg-black">
      {/* ── Sección 1: Countdown ──────────────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Gradient background matching the golden promo image */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, #c9860a 0%, #d4920e 25%, #b8790a 55%, #8a5a06 100%)",
          }}
        />

        {/* Image overlay — muestra la imagen del usuario si está disponible */}
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-4 py-16 text-center">
          <PromoImage
            src="/aura/promo-countdown.jpg"
            alt="AURA — Faltan 5 días para tu despertar"
            fallback={<CountdownFallback />}
          />
        </div>
      </section>

      {/* ── Sección 2: Beneficios ─────────────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f0e8]">
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-4 py-16 text-center">
          <PromoImage
            src="/aura/promo-benefits.jpg"
            alt="Tu momento, tu AURA — Equilibrio, concentración y rendimiento"
            fallback={<BenefitsFallback />}
          />
        </div>
      </section>

      {/* ── Sección 3: Lanzamiento ────────────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, #4a6fa5 0%, #2c4a6e 30%, #1a3040 65%, #0a1820 100%)",
          }}
        />
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-4 py-16 text-center">
          <PromoImage
            src="/aura/promo-launch.jpg"
            alt="AURA — Revelando el poder del agua. Lanzamiento muy pronto."
            fallback={<LaunchFallback />}
          />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-black py-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} AURA · Tu aura, tu energía, tu agua
      </footer>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────
   PromoImage: muestra la imagen si existe, o el fallback si no.
   En producción, coloca los archivos JPG/PNG en /public/aura/.
   ───────────────────────────────────────────────────────────── */
function PromoImage({
  src,
  alt,
  fallback,
}: {
  src: string;
  alt: string;
  fallback: React.ReactNode;
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full rounded-2xl shadow-2xl"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
          (
            e.currentTarget.nextElementSibling as HTMLElement
          ).style.display = "flex";
        }}
      />
      <div style={{ display: "none" }} className="w-full flex-col items-center">
        {fallback}
      </div>
    </>
  );
}

/* ── Fallbacks visuales (se muestran si la imagen no existe) ── */

function CountdownFallback() {
  return (
    <div className="flex w-full flex-col items-center gap-6 rounded-2xl bg-gradient-to-b from-[#d4920e] to-[#8a5a06] px-8 py-16 text-black shadow-2xl">
      <p className="text-2xl font-black uppercase tracking-widest">FALTAN</p>
      <p
        className="font-black leading-none"
        style={{
          fontSize: "8rem",
          background: "linear-gradient(180deg, #c8a84b, #8a6c2a)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "none",
        }}
      >
        5
      </p>
      <p className="text-3xl font-black uppercase tracking-widest">DÍAS</p>
      <p className="text-xl font-extrabold uppercase tracking-wider">
        PARA TU DESPERTAR
      </p>

      {/* Bottle placeholder */}
      <div className="my-4 flex h-56 w-28 flex-col items-center justify-center rounded-full border-4 border-black/20 bg-black/80 shadow-xl">
        <span className="text-3xl font-black text-[#c8a84b]">A</span>
        <span className="mt-1 text-sm font-bold tracking-[0.3em] text-[#c8a84b]">
          AURA
        </span>
      </div>

      <p className="text-lg font-black uppercase tracking-widest">
        TU AURA, TU ENERGÍA, TU AGUA
      </p>
      <div className="mt-2 flex items-center gap-8 text-3xl">
        <span title="Tiempo">🕐</span>
        <span title="Energía">🔋</span>
        <span title="Equilibrio">🧘</span>
      </div>
    </div>
  );
}

function BenefitsFallback() {
  const benefits = [
    { label: "EQUILIBRIO\nDIARIO", emoji: "🧘" },
    { label: "CONCENTRACIÓN\nCLARA", emoji: "💡" },
    { label: "CONCENTRACIÓN\nCLARA", emoji: "💧" },
    { label: "RENDIMIENTO\nNATURAL", emoji: "🏔️" },
  ];

  return (
    <div className="flex w-full flex-col items-center gap-6 rounded-2xl bg-[#f5f0e8] px-6 py-12 shadow-2xl">
      <p className="text-2xl font-black uppercase tracking-widest text-black">
        TU MOMENTO, TU AURA
      </p>

      <div className="grid w-full grid-cols-2 gap-3">
        {benefits.map((b, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow"
          >
            <span className="text-3xl">{b.emoji}</span>
            <p className="whitespace-pre-line text-center text-xs font-black uppercase tracking-wider text-black">
              {b.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex h-40 w-20 items-center justify-center rounded-full bg-black shadow-xl">
        <span className="text-lg font-black tracking-widest text-[#c8a84b]">
          AURA
        </span>
      </div>

      <p className="text-base font-black uppercase text-black">
        Y TÚ, ¿CÓMO DESPIERTAS TU AURA?
      </p>
      <p className="text-sm font-extrabold uppercase tracking-widest text-neutral-600">
        MÁS AGUA · MÁS VIDA · MÁS AURA ✦
      </p>
    </div>
  );
}

function LaunchFallback() {
  return (
    <div
      className="flex w-full flex-col items-center gap-6 rounded-2xl px-8 py-16 text-white shadow-2xl"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.6) 100%)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* AURA eye logo */}
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black shadow-xl ring-2 ring-white/20">
          <span className="text-2xl">👁</span>
        </div>
        <p className="mt-2 text-2xl font-black uppercase tracking-[0.4em]">
          AURA
        </p>
      </div>

      <p className="text-lg font-semibold uppercase tracking-widest text-white/80">
        REVELANDO EL PODER DEL AGUA
      </p>

      <div className="space-y-1 text-center">
        <p className="text-3xl font-black uppercase tracking-wider">
          LANZAMIENTO
        </p>
        <p className="text-4xl font-black italic uppercase tracking-wider text-white">
          MUY PRONTO
        </p>
      </div>

      <div className="mt-4 flex w-full justify-around">
        {[
          { icon: "💧", label: "PURA" },
          { icon: "⚖️", label: "EQUILIBRADA" },
          { icon: "🏔️", label: "ESENCIAL" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2">
            <span className="text-3xl">{item.icon}</span>
            <p className="text-xs font-black uppercase tracking-widest text-white/70">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
