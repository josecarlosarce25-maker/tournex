import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/ui/logo";
import { RankingBoard } from "@/components/ranking/ranking-board";

export const metadata: Metadata = {
  title: "Ranking de pádel",
  description:
    "El ranking de pádel de México. Sube de nivel jugando torneos, compite por tu estado y rétate con tus amigos.",
};

export default function RankingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-hair bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <Link href="/">
            <Wordmark size={26} />
          </Link>
          <nav className="flex items-center gap-1 text-sm font-semibold">
            <Link
              href="/ranking"
              className="rounded-soft px-3 py-1.5 text-lime"
            >
              Ranking
            </Link>
            <Link
              href="/login"
              className="rounded-soft px-3 py-1.5 text-tx3 transition-colors hover:text-tx"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <RankingBoard />
      </main>
    </div>
  );
}
