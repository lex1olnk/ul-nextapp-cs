import type { StateCreator } from "zustand";

export interface UISlice {
  // Состояния модальных окон
  showTournamentForm: boolean;
  showMatchForm: boolean;
  showParticipantForm: boolean;

  // Действия для модальных окон
  setShowTournamentForm: (show: boolean) => void;
  setShowMatchForm: (show: boolean) => void;
  setShowParticipantForm: (show: boolean) => void; // ДОБАВЛЯЕМ
  // Закрыть все модальные окна
  closeAllModals: () => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  // Начальное состояние
  showTournamentForm: false,
  showTeamForm: false,
  showParticipantForm: false,
  showMatchForm: false,

  // Действия
  setShowTournamentForm: (show: boolean) => set({ showTournamentForm: show }),
  setShowMatchForm: (show: boolean) => set({ showMatchForm: show }),
  setShowParticipantForm: (show: boolean) => set({ showParticipantForm: show }), // ДОБАВЛЯЕМ

  closeAllModals: () =>
    set({
      showTournamentForm: false,
      showMatchForm: false,
      showParticipantForm: false,
    }),
});
