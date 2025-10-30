import { demoParserService } from "@/lib/server-parse-services/demo-parser-service";
import { downloadService } from "@/lib/server-parse-services/download-service";
import { MatchesService } from "@/lib/server-parse-services/matchesService";
import { prismaSessionStore } from "@/lib/server-parse-services/prisma-session-store";

import { validateMatchesInput } from "@/lib/validation/match-validation";
import { Match, MatchesResponse, MatchNew } from "@/types";
import { NextResponse, NextRequest } from "next/server";

const matchesService: MatchesService = new MatchesService();

// Регулярное выражение для проверки URL матчей
const FASTCUP_URL_REGEX = /https:\/\/cs2\.fastcup\.net\/matches\/\d+/;
const CYBERSHOKE_URL_REGEX = /https:\/\/cybershoke\.net\/\w+\/match\/\d+/;

// Общее регулярное выражение для извлечения URL
const MATCH_URL_REGEX = new RegExp(
  `(${FASTCUP_URL_REGEX.source}|${CYBERSHOKE_URL_REGEX.source})`,
  "g"
);

// Функция для валидации URL матча
function isValidMatchUrl(url: string): boolean {
  return FASTCUP_URL_REGEX.test(url) || CYBERSHOKE_URL_REGEX.test(url);
}

// Функция для фильтрации валидных матчей
function filterValidMatches(matches: any[]): any[] {
  matches.forEach((match) => {
    const result = match.url.match(MATCH_URL_REGEX);
    if (result) match.url = result[0];
  });

  return matches.filter((m) => m.url && isValidMatchUrl(m.url));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Параметры фильтрации
    const tournamentId = searchParams.get("tournamentId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    // Параметры пагинации
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Параметры сортировки
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Строим фильтр
    const where: {
      tournamentId?: string;
      status?: string;
      type?: string;
    } = {};

    if (tournamentId) {
      where.tournamentId = tournamentId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // Получаем данные с пагинацией
    const [matches, total] = await Promise.all([
      matchesService.findAll({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          tournament: true,
          teams: true,
          maps: true,
        },
      }),
      matchesService.count({ where }),
    ]);

    // Метаданные пагинации
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      data: matches,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null,
      },
      filters: {
        tournamentId,
        status,
        type,
      },
    });
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MatchesResponse = await request.json();
    console.table(body);
    if (!body.matches) {
      return NextResponse.json(
        { error: "Missing matches array" },
        { status: 400 }
      );
    }

    validateMatchesInput(body.matches);

    // Фильтруем только валидные матчи
    const validMatches = filterValidMatches(body.matches);

    const matchesProgress = validMatches.map((match) => ({
      url: match.url,
      tournamentId: match.tournamentId,
      platform: match.platform,
      status: "pending",
      progress: 0,
      currentStep: "Waiting to start",
    }));

    // ✅ Создаем сессию в БД
    const session = await prismaSessionStore.createSession(matchesProgress);

    console.log("✅ Session created in database:", session.sessionId);
    console.log(matchesProgress);

    // Запускаем обработку
    processMatchesAsync(session.sessionId, validMatches);

    return NextResponse.json({
      sessionId: session.sessionId,
      status: "processing_started",
      totalMatches: session.totalMatches,
      message: "Matches are being processed.",
    });
  } catch (error) {
    console.error("Error processing matches request:", error);
    return NextResponse.json({ error: error }, { status: 400 });
  }
}

// Асинхронная обработка матчей (не блокирует ответ)
async function processMatchesAsync(sessionId: string, matches: MatchNew[]) {
  try {
    console.log(`Starting async processing for session: ${sessionId}`);

    // Обрабатываем матчи параллельно с ограничением
    const parallelLimit = 1; // Максимум 1 одновременных скачивания
    const chunks = [];

    for (let i = 0; i < matches.length; i += parallelLimit) {
      chunks.push(matches.slice(i, i + parallelLimit));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map((match) => processSingleMatch(sessionId, match))
      );
    }

    console.log(`Completed processing for session: ${sessionId}`);
  } catch (error) {
    console.error("Error in async processing:", error);
  }
}

async function processSingleMatch(sessionId: string, match: any) {
  let demoPath: string | undefined;

  try {
    console.log(`🔵 Starting match processing: ${match.url}`);
    console.log(`Session ID: ${sessionId}`);

    // ✅ Проверяем сессию перед началом
    const session = await prismaSessionStore.getSession(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found at start`);
    }

    console.log(`✅ Session verified, starting download...`);

    // 1. Скачиваем демо
    await prismaSessionStore.updateMatchProgress(sessionId, match.url, {
      status: "downloading",
      progress: 30,
      currentStep: "Downloading demo",
    });

    const downloadResult = await downloadService.downloadDemo(
      sessionId,
      match.url,
      match.platform
    );

    if (!downloadResult.success || !downloadResult.demoPath) {
      throw new Error(`Download failed: ${downloadResult.error}`);
    }

    demoPath = downloadResult.demoPath;
    console.log(`✅ Demo downloaded: ${demoPath}`);

    // 2. Отправляем на парсинг
    await prismaSessionStore.updateMatchProgress(sessionId, match.url, {
      status: "parsing",
      progress: 60,
      currentStep: "Sending to parser",
    });

    const parseResult = await demoParserService.parseDemo(
      sessionId,
      match.url,
      match.tournamentId,
      demoPath
    );

    if (!parseResult.success) {
      throw new Error(`Parse failed: ${parseResult.error}`);
    }

    console.log(`✅ Demo sent to parser, waiting for callback...`);

    const waitStartTime = Date.now();
    const waitTimeout = 30000; // 30 секунд

    while (Date.now() - waitStartTime < waitTimeout) {
      const session = await prismaSessionStore.getSession(sessionId);
      const matchProgress = session?.matches.find(
        (m: any) => m.url === match.url
      );

      if (matchProgress?.status === "completed") {
        console.log(`✅ Callback received, parsing completed`);
        break;
      }

      if (matchProgress?.status === "error") {
        throw new Error(`Parsing failed: ${matchProgress.error}`);
      }

      // Ждем 2 секунды перед следующей проверкой
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Проверяем таймаут
    if (Date.now() - waitStartTime >= waitTimeout) {
      throw new Error("Parsing timeout - no callback received");
    }
    // 3. Ждем callback (не блокируем - callback сам обновит статус)
    // Просто выходим - callback обновит статус когда придет
  } catch (error) {
    console.error(`❌ Error processing match ${match.url}:`, error);

    await prismaSessionStore.updateMatchProgress(sessionId, match.url, {
      status: "error",
    });

    // Очищаем файл при ошибке
    if (demoPath) {
      await downloadService.cleanupDemoFile(demoPath);
    }
  }
}
