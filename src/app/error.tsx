"use client";

// Error boundary for route segments below the root. Catches render-time
// crashes and offers a "try again" button.
import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in dev; in prod we just log so we don't lose breadcrumbs.
    console.error("Tournex error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="surface rounded-xl p-10">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg3 ring-1 ring-hair">
            <Logo size={32} />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-red">
            Algo se rompió
          </p>
          <h1 className="mt-2 text-2xl font-bold">No esperábamos esto</h1>
          <p className="mt-3 text-sm text-tx2">
            La pantalla anterior se cayó. Tu información está a salvo — todo
            está guardado en la nube. Intenta de nuevo o vuelve al inicio.
          </p>
          {error.digest && (
            <p className="mt-4 font-mono text-[10px] text-tx3">
              Código: {error.digest}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-soft bg-gradient-to-b from-lime2 to-lime px-5 py-3 text-sm font-semibold text-bg shadow-[0_4px_20px_-4px_rgba(173,255,47,0.5)] transition-all hover:-translate-y-0.5"
            >
              Intentar otra vez
            </button>
            <Link
              href="/dashboard"
              className="rounded-soft border border-br2 bg-bg2 px-5 py-3 text-sm font-semibold text-tx transition-all hover:-translate-y-0.5 hover:border-tx3"
            >
              Volver al dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
