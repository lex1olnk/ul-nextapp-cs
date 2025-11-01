import StatsSectionComponent from "@/components/player/StatSection";

export async function StatsSection({
  playerId,
  tournamentId,
}: {
  playerId: number;
  tournamentId: string | null;
}) {
  // const statStats = await getStatsInfo(playerId, tournamentId);

  return <StatsSectionComponent stats={[]} moreStats={[]} />;
}
