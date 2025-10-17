import { DemoToDatabase } from "@/lib/demoDatabase";
import { MatchesService } from "@/lib/services/matchesService";
import { MatchInput } from "@/types";
import { unlinkSync } from "fs";
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

// pages/api/process-matches.ts или app/api/process-matches/route.ts

export async function POST(request: Request) {
  try {
    const { matches }: { matches: MatchInput[] } = await request.json();

    const results = await Promise.all(
      matches.map(async (match) => {
        const demoFileName = `demos/${Date.now()}_${Math.random().toString(36).substring(7)}.dem`;
        try {
          // Создаем уникальное имя файла для демки

          // Логика скачивания в зависимости от платформы
          const downloadResult: {
            success: boolean;
            error?: string;
          } = await matchesService.downloadDemoBasedOnPlatform(
            match,
            demoFileName
          );

          if (!downloadResult.success) {
            throw new Error(`Failed to download demo: ${downloadResult.error}`);
          }

          // Обрабатываем демку
          const demoClass = new DemoToDatabase(demoFileName);
          const processResult = await demoClass.processDemo();

          // Удаляем временный файл
          await unlinkSync(demoFileName);

          return {
            success: true,
            matchId: match.tournamentId,
            url: match.url,
            processedData: processResult,
          };
        } catch (error) {
          // В случае ошибки все равно пытаемся удалить файл
          try {
            await unlinkSync(demoFileName);
          } catch (deleteError) {
            console.error("Failed to delete demo file:", deleteError);
          }

          return {
            success: false,
            matchId: match.tournamentId,
            url: match.url,
            error: "error",
          };
        }
      })
    );

    return Response.json({ results });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
