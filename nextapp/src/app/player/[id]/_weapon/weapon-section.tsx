// app/player/[id]/weapons/page.tsx
import { getGraphWeapons } from "@/services";
import { WeaponsGraph } from "@/components/player";

export default async function WeaponsPage({
  playerId,
  tournamentId,
}: {
  playerId: number;
  tournamentId: string | null;
}) {
  const stats = await getGraphWeapons(playerId, tournamentId);

  const transformedData = stats.map((weaponStat) => ({
    title: weaponStat.weapon,
    rows: [
      {
        key: "totalKills",
        label: "Всего убийств",
        value: weaponStat.kills,
      },
      { key: "wallbang", label: "Сквозь стену", value: weaponStat.wallbang },
      { key: "headshot", label: "Хедшоты", value: weaponStat.headshot },
      { key: "airshot", label: "В воздухе", value: weaponStat.airshot },
      ...(weaponStat.noscope !== null
        ? [{ key: "noscope", label: "Без прицела", value: weaponStat.noscope }]
        : []),
    ],
  }));
  if (stats.length === 0) return <div>Данные отсутствуют</div>;
  return <WeaponsGraph data={transformedData} />;
}
