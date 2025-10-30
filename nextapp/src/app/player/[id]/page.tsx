import { Suspense } from "react";
import WeaponsPage from "./_weapon/weapon-section";
import { WeaponsSkeleton } from "./_weapon/weapon-skeleton";
import { ClutchSection } from "./_clutch/clutch-section";

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
    <div className="relative flex justify-center flex-col bg-black/70">
      <Suspense fallback={<WeaponsSkeleton />}>
        <WeaponsPage playerId={id} tournamentId={tournamentId} />
      </Suspense>
      <Suspense>
        <ClutchSection playerId={id} tournamentId={tournamentId} />
      </Suspense>
    </div>
  );
}
