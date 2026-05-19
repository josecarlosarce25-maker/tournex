import { TournamentDetail } from "@/components/tournament/tournament-detail";

export default async function TournamentPage({
  params,
}: PageProps<"/tournament/[id]">) {
  const { id } = await params;
  return <TournamentDetail id={id} />;
}
