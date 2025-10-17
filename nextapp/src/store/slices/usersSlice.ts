import { type StateCreator } from "zustand";
import type { Profile, ApiState, PaginationParams } from "@/types";
import { getProfiles, getProfilesCount } from "@/services";

export interface ProfileSlice extends ApiState {
  profiles: Profile[];
  totalPages: number;
  totalProfiles: number;
  loadingTotalCount: boolean;
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
  };

  // Действия
  fetchProfiles: (page?: number, pageSize?: number) => Promise<void>;
  fetchTotalProfilesCount: () => Promise<void>;
  setProfiles: (profiles: Profile[]) => void;
  setPagination: (pagination: Partial<ProfileSlice["pagination"]>) => void;
  clearError: () => void;
}

export const createProfileSlice: StateCreator<
  ProfileSlice,
  [],
  [],
  ProfileSlice
> = (set, get) => ({
  // Начальное состояние
  profiles: [],

  loading: false,
  error: null,
  totalProfiles: 0,
  totalPages: 0,
  loadingTotalCount: false,
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0,
  },

  // Действия
  fetchProfiles: async (page = 1, pageSize = 10) => {
    set({ loading: true, error: null });

    try {
      const skip = (page - 1) * pageSize;
      const params: PaginationParams = { take: pageSize, skip };

      const response: Profile[] = await getProfiles(params);

      set({
        profiles: response,
        pagination: {
          currentPage: page,
          pageSize,
          total: pageSize,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch profiles",
        loading: false,
      });
    }
  },

  fetchTotalProfilesCount: async () => {
    set({ loadingTotalCount: true });

    try {
      const totalProfiles = await getProfilesCount();
      const totalPages = Math.ceil(totalProfiles / 10);
      set({
        totalPages,
        loadingTotalCount: false,
      });
    } catch (error) {
      console.error("Failed to fetch total count:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch total count",
        loadingTotalCount: false,
      });
    }
  },

  setProfiles: (profiles: Profile[]) => {
    set({ profiles });
  },

  setPagination: (paginationUpdates) => {
    set((state) => ({
      pagination: { ...state.pagination, ...paginationUpdates },
    }));
  },

  clearError: () => {
    set({ error: null });
  },
});
