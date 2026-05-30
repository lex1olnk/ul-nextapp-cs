import MatchImporter from "@/components/tournaments/MatchImporter";
import { UploadGuard } from "@/components/UploadGuard";
import { getTournaments } from "./api";

export const revalidate = 3600;

export default async function UploadMatchesPage() {
  const tournaments = await getTournaments();

  return (
    <UploadGuard>
      <MatchImporter tournaments={tournaments} />
    </UploadGuard>
  );
}
