"use server";

import MatchImporter from "@/components/tournaments/MatchImporter";
import { getTournaments } from "./api";

export default async function UploadMatchesPage() {
  const tournaments = await getTournaments();

  return (
    <div>
      <MatchImporter tournaments={tournaments} />
    </div>
  );
}
