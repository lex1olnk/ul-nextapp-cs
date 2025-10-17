import type { PaginationParams, Profile } from "@/types";
import { api } from "./api";

// Получение профилей с пагинацией
export const getProfiles = async (
  params: PaginationParams
): Promise<Profile[]> => {
  const response = await api.get<Profile[]>("/users/profiles", {
    params: {
      take: params.take,
      skip: params.skip,
    },
  });

  return response.data;
};

// Получение общего количества профилей (опционально)
export const getProfilesCount = async (): Promise<number> => {
  const response = await api.get<{
    count: number;
  }>("/users/profiles/count");
  return response.data.count;
};
