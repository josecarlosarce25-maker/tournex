import { Logo } from "@/components/ui/logo";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Logo size={38} />
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-tx3">
          Cargando…
        </p>
      </div>
    </div>
  );
}
