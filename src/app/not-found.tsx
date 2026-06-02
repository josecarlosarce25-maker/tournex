import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="surface glow rounded-xl p-10">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg3 ring-1 ring-hair">
            <Logo size={32} />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-lime">
            Error 404
          </p>
          <h1 className="mt-2 text-2xl font-bold">No encontramos esa página</h1>
          <p className="mt-3 text-sm text-tx2">
            Puede que el torneo se haya borrado, el link esté mal escrito, o la
            ruta ya no exista.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-soft border border-br2 bg-bg2 px-5 py-3 text-sm font-semibold text-tx transition-all hover:-translate-y-0.5 hover:border-tx3"
          >
            Volver al inicio →
          </Link>
        </div>
      </div>
    </div>
  );
}
