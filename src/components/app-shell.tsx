// The authenticated-area layout: sidebar + top bar. Guards against signed-out
// access by bouncing to /login.
"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wordmark } from "@/components/ui/logo";
import { useUser, useTournaments, store } from "@/lib/data/use-store";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useUser();
  const tournaments = useTournaments();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Bounce signed-out visitors to /login once the auth check finishes.
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-tx3">
        Cargando…
      </div>
    );
  }

  const navItem = (
    href: string,
    icon: string,
    label: string,
    badge?: number,
  ) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`group relative flex items-center gap-3 rounded-soft px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          active
            ? "bg-lime/10 text-lime ring-1 ring-inset ring-lime/15"
            : "text-tx2 hover:bg-bg3 hover:text-tx"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full bg-lime" style={{ width: 3 }} />
        )}
        <span className="w-5 text-center text-base">{icon}</span>
        {label}
        {badge != null && badge > 0 && (
          <span className="ml-auto rounded-full bg-lime/12 px-2 py-0.5 font-mono text-[11px] font-semibold text-lime ring-1 ring-inset ring-lime/15">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-hair bg-bg2 transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-hair p-5">
          <Wordmark />
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          <div className="px-3 pb-1.5 pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-tx3">
            Menú
          </div>
          {navItem("/dashboard", "📊", "Dashboard", tournaments.length)}
          {navItem("/tournament/new", "➕", "Nuevo Torneo")}
          {navItem("/contacts", "👥", "Contactos")}

          {tournaments.length > 0 && (
            <>
              <div className="px-3 pb-1.5 pt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-tx3">
                Torneos
              </div>
              {tournaments.map((t) => {
                const active = pathname === `/tournament/${t.id}`;
                const icon =
                  t.status === "live"
                    ? "🔴"
                    : t.status === "done"
                      ? "✅"
                      : "🏆";
                return (
                  <Link
                    key={t.id}
                    href={`/tournament/${t.id}`}
                    className={`flex items-center gap-3 rounded-soft px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-lime/10 text-lime ring-1 ring-inset ring-lime/15"
                        : "text-tx2 hover:bg-bg3 hover:text-tx"
                    }`}
                  >
                    <span className="w-5 text-center text-base">{icon}</span>
                    <span className="truncate">{t.name}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="border-t border-hair p-3">
          <div className="flex items-center gap-2.5 rounded-soft p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-lime/20 to-lime/5 text-sm font-bold text-lime ring-1 ring-inset ring-lime/20">
              {user.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold">
                {user.name}
              </div>
              <div className="truncate text-[11px] text-tx3">
                {user.email}
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              await store.signOut();
              router.replace("/login");
            }}
            className="mt-1 w-full rounded-soft border border-hair py-2 text-xs font-medium text-tx3 transition-colors hover:border-red/40 hover:bg-red/5 hover:text-red"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-hair bg-bg/70 px-4 py-3 backdrop-blur-xl md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-soft border border-br2 px-2.5 py-1.5 text-lg"
          >
            ☰
          </button>
          <Wordmark size={24} />
        </div>
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="animate-fade-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
