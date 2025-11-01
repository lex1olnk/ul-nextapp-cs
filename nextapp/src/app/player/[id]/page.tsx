import { Suspense } from "react";
import WeaponsPage from "./_weapon/weapon-section";
import { WeaponsSkeleton } from "./_weapon/weapon-skeleton";
import { ClutchSection } from "./_clutch/clutch-section";
import { ClutchSectionSkeleton } from "./_clutch/clutch-skeleton";
import { PlayerCardSection } from "./_playerCard/card-section";
import { StatsSection } from "./_stats/stats-section";

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: number }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const tournamentId = resolvedSearchParams.tournamentId as string | null;

  return (
    <div className="relative flex justify-center flex-col w-6xl mx-auto ">
      <div></div>
      <Suspense fallback={<WeaponsSkeleton />}>
        <WeaponsPage playerId={id} tournamentId={tournamentId} />
      </Suspense>
      <Suspense fallback={<ClutchSectionSkeleton />}>
        <ClutchSection playerId={id} tournamentId={tournamentId} />
      </Suspense>

      <PlayerCardSection playerId={id} />
      <StatsSection playerId={id} tournamentId={tournamentId} />
    </div>
  );
}
