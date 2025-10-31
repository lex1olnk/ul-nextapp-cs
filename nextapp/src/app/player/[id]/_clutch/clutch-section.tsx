import { ClutchStats } from "@/components/player";
import { getClutchStats } from "@/services";

export async function ClutchSection({
  playerId,
  tournamentId,
}: {
  playerId: number;
  tournamentId: string | null;
}) {
  const clutchStats = await getClutchStats(playerId, tournamentId);

  return <ClutchStats data={clutchStats} />;
}
