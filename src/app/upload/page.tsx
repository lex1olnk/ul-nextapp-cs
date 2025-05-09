"use server";

import MatchImporter from "@/components/tournaments/MatchImporter";
import { getTournaments } from "./api";

export const revalidate = 3600;

export default async function UploadMatchesPage() {
  const tournaments = await getTournaments();

  return (
    <div>
      <MatchImporter tournaments={tournaments} />
    </div>
  );
}
