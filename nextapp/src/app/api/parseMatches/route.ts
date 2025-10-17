import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import https from "https";
import { promisify } from "util";
import { DemoToDatabase } from "@/lib/demoDatabase";

const sleep = promisify(setTimeout);

interface ParseDemoRequest {
  demoUrl: string;
}

interface ParseDemoResponse {
  success: boolean;
  message: string;
  matchId?: string | null;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ParseDemoResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const { demoUrl }: ParseDemoRequest = req.body;

  if (!demoUrl) {
    return res.status(400).json({
      success: false,
      message: "demoUrl is required",
    });
  }

  let demoPath: string | null = null;

  try {
    console.log("📥 Starting demo processing for URL:", demoUrl);

    // Шаг 1: Скачиваем демо-файл
    demoPath = await downloadDemoFile(demoUrl);

    // Шаг 2: Парсим демо-файл
    const parser = new DemoToDatabase(demoPath);
    await parser.processDemo();

    // Шаг 3: Удаляем временный файл
    await deleteDemoFile(demoPath);

    console.log("✅ Demo processing completed successfully");

    res.status(200).json({
      success: true,
      message: "Demo processed successfully",
      matchId: parser.matchId,
    });
  } catch (error) {
    console.error("❌ Demo processing failed:", error);

    // Пытаемся очистить временные файлы при ошибке
    if (demoPath) {
      try {
        await deleteDemoFile(demoPath);
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError);
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    res.status(500).json({
      success: false,
      message: "Demo processing failed",
      error: errorMessage,
    });
  }
}

// Функция для скачивания демо-файла
async function downloadDemoFile(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileName = `demo_${Date.now()}.dem`;
    const filePath = path.join(process.cwd(), "temp", fileName);

    // Создаем папку temp если её нет
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const file = fs.createWriteStream(filePath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download file: ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(`✅ Demo downloaded: ${filePath}`);
          resolve(filePath);
        });
      })
      .on("error", (err) => {
        // Удаляем частично скачанный файл
        fs.unlink(filePath, () => {
          reject(err);
        });
      });
  });
}

// Функция для удаления демо-файла
async function deleteDemoFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting demo file:", err);
        reject(err);
      } else {
        console.log(`🗑️ Demo file deleted: ${filePath}`);
        resolve();
      }
    });
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
    responseLimit: false,
  },
};
