import React, { useState, useEffect } from "react";

import type { MatchInput, Tournament } from "@/types";
import { useStore } from "@/store";

const AddMatchForm: React.FC = () => {
  const { tournaments, addMatches, setShowMatchForm, showMatchForm } =
    useStore();

  const [tournamentId, setTournamentId] = useState<string>("");
  const [matchText, setMatchText] = useState<string>("");
  const [parsedMatches, setParsedMatches] = useState<MatchInput[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Анимация появления/исчезновения
  useEffect(() => {
    if (showMatchForm) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [showMatchForm]);

  // Парсинг текста при изменении
  useEffect(() => {
    if (matchText.trim()) {
      const lines = matchText.split("\n").filter((line) => line.trim());
      const matches: MatchInput[] = lines.map((line) => ({
        url: line.trim(),
        isFinal: false,
        tournamentId: tournamentId,
        platform: "fastcup",
      }));
      setParsedMatches(matches);
    } else {
      setParsedMatches([]);
    }
  }, [matchText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedMatches.length === 0) {
      alert("Добавьте хотя бы один матч");
      return;
    }

    const matchData: { matches: MatchInput[] } = {
      matches: parsedMatches,
    };
    console.log(matchData);
    addMatches(matchData);

    // Сброс формы
    setTournamentId("");
    setMatchText("");
    setParsedMatches([]);
  };

  const handleToggleFinal = (index: number) => {
    setParsedMatches((prev) =>
      prev.map((match, i) =>
        i === index ? { ...match, isFinal: !match.isFinal } : match
      )
    );
  };

  const handleTogglePlatform = (index: number) => {
    setParsedMatches((prev) =>
      prev.map((match, i) =>
        i === index
          ? {
              ...match,
              platform: match.platform === "fastcup" ? "cybershoke" : "fastcup",
            }
          : match
      )
    );
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowMatchForm(false);
    }, 300);
  };

  if (!showMatchForm && !isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black/30 text-black flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          isVisible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 -translate-y-4 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Добавить матчи</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
        >
          {/* Селект турнира */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Турнир (необязательно)
            </label>
            <select
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Обычные матчи (без турнира)</option>
              {tournaments.map((tournament: Tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name} ({tournament.status})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Если оставить пустым, матчи будут считаться обычными
            </p>
          </div>

          {/* Текстовое поле для матчей */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Список матчей *
            </label>
            <textarea
              value={matchText}
              onChange={(e) => setMatchText(e.target.value)}
              placeholder={`Введите матчи, каждый с новой строки. Например:
https://cs2.fastcup.net/matches/19162853 Team A vs Team B
https://cs2.fastcup.net/matches/19162854 Another Team vs Opponent`}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Каждая строка - отдельный матч. Формат: ссылка + описание
            </p>
          </div>

          {/* Предпросмотр распарсенных матчей */}
          {parsedMatches.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Предпросмотр матчей ({parsedMatches.length})
              </label>
              <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                {parsedMatches.map((match, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border transition-all duration-200 ${
                      match.isFinal
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 break-words">
                          {match.url}
                        </p>
                        {match.url.includes("https://") && (
                          <a
                            href={match.url
                              .split(" ")
                              .find((part) => part.startsWith("https://"))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                          >
                            Открыть ссылку
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleFinal(index)}
                        className={`ml-3 px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                          match.isFinal
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                      >
                        {match.isFinal ? "Финальный ✓" : "Сделать финальным"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePlatform(index)}
                        className={`ml-3 px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                          match.platform === "fastcup"
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-blue-400 hover:bg-blue-600 text-white"
                        }`}
                      >
                        {match.platform}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Финальные матчи отмечены желтым цветом.</strong> Все
                  данные будут отправлены на сервер как есть, без фильтрации.
                </p>
              </div>
            </div>
          )}

          {/* Статистика */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Матчей: {parsedMatches.length}</span>
            <span>
              Финальных: {parsedMatches.filter((m) => m.isFinal).length}
            </span>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="submit"
              disabled={parsedMatches.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md transition-all duration-200 font-medium transform hover:scale-105 active:scale-95"
            >
              Добавить матчи ({parsedMatches.length})
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-md transition-all duration-200 font-medium transform hover:scale-105 active:scale-95"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMatchForm;
