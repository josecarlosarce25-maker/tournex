// Minimal header/footer for the public (no-login) pages.
import Link from "next/link";
import { Wordmark } from "@/components/ui/logo";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-hair bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link href="/">
            <Wordmark size={26} />
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-tx3 transition-colors hover:text-tx"
          >
            Soy organizador
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8">
        <div className="animate-fade-up">{children}</div>
      </main>
      <footer className="border-t border-hair py-6 text-center text-xs text-tx3">
        Hecho con Tournex
      </footer>
    </div>
  );
}

export function NotFoundCard() {
  return (
    <div className="surface rounded-card p-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg3 text-3xl ring-1 ring-hair">
        🔍
      </div>
      <h2 className="text-lg font-bold">Torneo no encontrado</h2>
      <p className="mt-2 text-sm text-tx3">
        El link puede tener un error, o el torneo fue eliminado por el
        organizador. Verifica que la dirección esté completa.
      </p>
    </div>
  );
}
