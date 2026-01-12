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
  params: Promise<{ id: string }>; // В Next.js параметры пути приходят как строки
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  // Безопасное извлечение tournamentId
  const tournamentIdRaw = resolvedSearchParams.tournamentId;
  const tournamentId =
    typeof tournamentIdRaw === "string" ? tournamentIdRaw : null;

  // Не забудьте преобразовать id игрока в число, если API ждет number
  const playerId = parseInt(id, 10);
  console.log({ playerId, tournamentId });
  return (
    <div className="relative flex justify-center flex-col w-6xl mx-auto ">
      <div></div>
      <Suspense fallback={<WeaponsSkeleton />}>
        <WeaponsPage playerId={playerId} tournamentId={tournamentId} />
      </Suspense>
      <Suspense fallback={<ClutchSectionSkeleton />}>
        <ClutchSection playerId={playerId} tournamentId={tournamentId} />
      </Suspense>

      <PlayerCardSection playerId={playerId} />
      <StatsSection playerId={playerId} tournamentId={tournamentId} />
    </div>
  );
}
