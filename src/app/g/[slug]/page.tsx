import Link from "next/link";
import { Wordmark } from "@/components/ui/logo";
import { FriendGroupBoard } from "@/components/ranking/friend-group-board";

export default async function FriendGroupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-hair bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <Link href="/">
            <Wordmark size={26} />
          </Link>
          <Link href="/ranking" className="text-sm font-semibold text-tx3 transition-colors hover:text-tx">
            Ranking general
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <FriendGroupBoard slug={slug} />
      </main>
    </div>
  );
}
