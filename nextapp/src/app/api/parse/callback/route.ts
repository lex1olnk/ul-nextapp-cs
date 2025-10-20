// app/api/parse/callback/route.ts

import { prismaSessionStore } from "@/lib/services/prisma-session-store";
import { NextRequest, NextResponse } from "next/server";

// app/api/parse/callback/route.ts
export async function POST(request: NextRequest) {
  console.log("🎯 CALLBACK ENDPOINT HIT!");

  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const sessionId = searchParams.get("sessionId");
    const matchUrl = searchParams.get("matchUrl");

    console.log(`📨 Callback parameters:`, {
      sessionId,
      matchUrl,
      allParams: Array.from(searchParams.entries()),
    });

    console.log(`🔍 Full URL: ${request.url}`);

    if (!sessionId) {
      console.error("❌ MISSING sessionId");
      return NextResponse.json(
        {
          error: "Missing sessionId",
          receivedParams: Array.from(searchParams.entries()),
        },
        { status: 400 }
      );
    }

    if (!matchUrl) {
      console.error("❌ MISSING matchUrl");
      return NextResponse.json(
        {
          error: "Missing matchUrl",
          receivedParams: Array.from(searchParams.entries()),
        },
        { status: 400 }
      );
    }

    const result = await request.json();
    console.log(`📊 Callback payload:`, JSON.stringify(result, null, 2));

    // ✅ Проверяем что сессия существует
    const session = await prismaSessionStore.getSession(sessionId);
    if (!session) {
      console.error(`❌ Session ${sessionId} not found in database`);
      return NextResponse.json(
        {
          error: "Session not found",
          sessionId,
        },
        { status: 404 }
      );
    }

    console.log(`✅ Session found, updating progress...`);

    if (result.success) {
      console.log(`✅ Parsing completed for ${matchUrl}`);

      await prismaSessionStore.updateMatchProgress(sessionId, matchUrl, {
        status: "completed",
        progress: 100,
        currentStep: "Processing completed",
        data: result.data || null,
      });

      console.log(`✅ Progress updated to completed`);
    } else {
      console.error(`❌ Parsing failed for ${matchUrl}:`, result.error);

      await prismaSessionStore.updateMatchProgress(sessionId, matchUrl, {
        status: "error",
        error: result.error,
        progress: 100,
      });
    }

    return NextResponse.json({
      status: "ok",
      message: "Callback processed successfully",
    });
  } catch (error) {
    console.error("❌ Callback error:", error);
    return NextResponse.json(
      {
        error: "Callback processing failed",
        details: error,
      },
      { status: 500 }
    );
  }
}
