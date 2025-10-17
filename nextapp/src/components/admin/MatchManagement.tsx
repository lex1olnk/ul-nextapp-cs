import React, { useEffect, useState } from "react";
import { useStore } from "@/store";
import type { MatchQueryParams } from "@/types/match";
import { deleteMatch } from "@/services";

export const MatchManagement: React.FC = () => {
  const setShowMatchForm = useStore((state) => state.setShowMatchForm);
  const fetchMatches = useStore((state) => state.fetchMatches);
  const tournaments = useStore((state) => state.tournaments);
  const fetchTournaments = useStore((state) => state.fetchTournaments);

  const matches = useStore((state) => state.matches);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);

  const [pagination, setPagination] = useState({
    skip: 0,
    take: 10,
    total: 0,
  });

  // Фильтры
  const [filters, setFilters] = useState({
    tournamentId: "",
    status: "",
    dateFrom: "",
    sortBy: "startedAt_desc",
  });

  useEffect(() => {
    fetchTournaments();
    loadMatches();
  }, [pagination.skip, pagination.take, filters]);

  const loadMatches = async () => {
    try {
      // Формируем параметры запроса
      const params: MatchQueryParams = {
        skip: pagination.skip,
        take: pagination.take,
        include: JSON.stringify({ tournament: true }),
        orderBy: getOrderBy(filters.sortBy),
        where: JSON.stringify({
          ...(filters.tournamentId && { tournamentId: filters.tournamentId }),
          ...(filters.status && { status: filters.status }),
          ...(filters.dateFrom && {
            startedAt: { gte: new Date(filters.dateFrom).toISOString() },
          }),
        }),
      };

      await fetchMatches(params);
    } catch (err) {
      console.error("Failed to load matches:", err);
    }
  };

  const getOrderBy = (sortBy: string) => {
    const [field, direction] = sortBy.split("_");
    return JSON.stringify({ [field]: direction });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, skip: 0 })); // Сброс пагинации при изменении фильтров
  };

  const handlePageChange = (newSkip: number) => {
    setPagination((prev) => ({ ...prev, skip: newSkip }));
  };

  const handleRetry = () => {
    loadMatches();
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (
      !confirm(
        "Вы уверены, что хотите удалить этот матч? Все связанные данные также будут удалены."
      )
    ) {
      return;
    }

    try {
      // Вызов API для удаления матча с cascade
      await deleteMatch(matchId);

      // Обновляем список матчей после удаления
      await loadMatches();
    } catch (err) {
      console.error("Failed to delete match:", err);
    }
  };

  const clearFilters = () => {
    setFilters({
      tournamentId: "",
      status: "",
      dateFrom: "",
      sortBy: "startedAt_desc",
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "Ожидание",
      ongoing: "В процессе",
      completed: "Завершен",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ongoing: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 ">
        <h2 className="text-2xl font-bold text-gray-800">Управление матчами</h2>
        <button
          onClick={() => setShowMatchForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
        >
          <span>+ Добавить матчи</span>
        </button>
      </div>

      {/* Фильтры */}
      <div
        aria-disabled
        className="bg-white rounded-lg border p-4 mb-6 text-black border-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Фильтр по турнирам */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Турнир
            </label>
            <select
              value={filters.tournamentId}
              onChange={(e) =>
                handleFilterChange("tournamentId", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все турниры</option>
              {tournaments?.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </div>

          {/* Фильтр по статусу */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="pending">Ожидание</option>
              <option value="ongoing">В процессе</option>
              <option value="completed">Завершен</option>
            </select>
          </div>

          {/* Фильтр по дате */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата с
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Сортировка */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сортировка
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="startedAt_desc">Дата (новые)</option>
              <option value="startedAt_asc">Дата (старые)</option>
              <option value="tournamentId_asc">Турнир (А-Я)</option>
              <option value="status_asc">Статус</option>
            </select>
          </div>
        </div>

        {/* Кнопка сброса фильтров */}
        <div className="flex justify-end mt-4">
          <button
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>

      {/* Состояние загрузки */}
      {loading && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="text-gray-500 mb-4">
            <svg
              className="animate-spin w-8 h-8 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-gray-600">Загрузка матчей...</p>
        </div>
      )}

      {/* Состояние ошибки */}
      {error && !loading && (
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Произошла ошибка
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Попробовать снова
          </button>
        </div>
      )}

      {/* Успешная загрузка - пустой список */}
      {!loading && !error && matches.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {Object.values(filters).some((v) => v)
              ? "Матчи не найдены"
              : "Матчи еще не добавлены"}
          </h3>
          <p className="text-gray-600 mb-4">
            {Object.values(filters).some((v) => v)
              ? "Попробуйте изменить параметры фильтрации"
              : "Используйте кнопку 'Добавить матчи' чтобы начать импорт матчей из текстового списка"}
          </p>
          {Object.values(filters).some((v) => v) && (
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      )}

      {/* Успешная загрузка - список матчей */}
      {!loading && !error && matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Найдено матчей: {pagination.total}
            </h3>

            {/* Пагинация */}
            {pagination.total > pagination.take && (
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    handlePageChange(
                      Math.max(0, pagination.skip - pagination.take)
                    )
                  }
                  disabled={pagination.skip === 0}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Назад
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  {pagination.skip + 1}-
                  {Math.min(
                    pagination.skip + pagination.take,
                    pagination.total
                  )}{" "}
                  из {pagination.total}
                </span>
                <button
                  onClick={() =>
                    handlePageChange(pagination.skip + pagination.take)
                  }
                  disabled={
                    pagination.skip + pagination.take >= pagination.total
                  }
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Вперед
                </button>
              </div>
            )}
          </div>

          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Заголовок с информацией о турнире */}
                  <div className="flex items-center space-x-3 mb-3">
                    {match.tournament ? (
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                          {match.tournament.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            match.tournament.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {match.tournament.status === "active"
                            ? "Активный"
                            : "Завершен"}
                        </span>
                      </div>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        Без турнира
                      </span>
                    )}
                  </div>

                  {/* Основная информация о матче */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Матч #{match.id}
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Формат:</span>
                          <span>
                            Best of {match.bestOf} • {match.type}
                          </span>
                        </div>
                        {match.teams && match.teams.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Команды:</span>
                            <span className="text-gray-800">
                              {match.teams.join(" vs ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            Создан:{" "}
                            {new Date(match.startedAt).toLocaleDateString(
                              "ru-RU"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          <span>
                            Обновлен:{" "}
                            {new Date(match.updatedAt).toLocaleDateString(
                              "ru-RU"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Текст матча (если есть) */}
                  {match.text && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {match.text}
                      </p>
                    </div>
                  )}
                </div>
                {/* Бейджи и действия */}
                // В секции рендеринга матчей, обновите блок с бейджами и
                действиями:
                <div className="flex flex-col items-end space-y-2 ml-4 min-w-[140px]">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Удалить матч"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <span
                      className={`px-2 py-1 rounded text-xs border text-center ${
                        match.isFinal
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200 font-medium"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {match.isFinal ? "Финальный" : "Обычный"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs border text-center ${getStatusColor(
                        match.status
                      )}`}
                    >
                      {getStatusText(match.status)}
                    </span>
                  </div>

                  {match.url && (
                    <a
                      href={match.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs flex items-center justify-center space-x-1 mt-2"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span>Ссылка</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchManagement;
