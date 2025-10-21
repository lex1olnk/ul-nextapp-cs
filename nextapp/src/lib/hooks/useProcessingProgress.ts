// hooks/useProcessingProgress.ts
import { useState, useEffect, useCallback } from "react";
import { ProcessingProgress } from "@/types/demo-processing";

export const useProcessingProgress = (sessionId: string | null) => {
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/matches/progress/${sessionId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }

      const data = await response.json();
      setProgress(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching progress:", err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Авто-обновление прогресса
  useEffect(() => {
    if (!sessionId) return;

    fetchProgress();

    // Обновляем каждые 2 секунды если еще обрабатывается
    const interval = setInterval(() => {
      if (progress?.status === "processing") {
        fetchProgress();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, progress?.status, fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    refetch: fetchProgress,
  };
};
