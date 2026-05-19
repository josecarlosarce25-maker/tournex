import { PlayerView } from "@/components/public/player-view";

export default async function PublicPlayerPage({
  params,
}: PageProps<"/t/[slug]">) {
  const { slug } = await params;
  return <PlayerView slug={slug} />;
}
