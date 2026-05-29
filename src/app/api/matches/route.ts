import { MatchesService } from "@/lib/services/matchesService";
import { NextResponse } from "next/server";

const matchesService: MatchesService = new MatchesService();

export async function GET() {
  try {
    const matches = await matchesService.findAll({});
    return NextResponse.json(matches);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
