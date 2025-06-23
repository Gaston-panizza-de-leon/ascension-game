import type { StateCreator } from 'zustand';

// --- CONSTANTES ---
export const calculateXpForLevel = (level: number): number => {
  const BASE_XP_REQUIRED = 5;
  const XP_MULTIPLIER = 1.1;
  return BASE_XP_REQUIRED * Math.pow(XP_MULTIPLIER, level - 1);
};

// --- INTERFAZ ---
export interface ExplorationSlice {
  explorationLevel: number;
  currentXp: number;
  addXp: (amount: number) => void;
  levelUp: () => void;
  resetXp: () => void;
}

// --- CREACIÓN ---
export const createExplorationSlice: StateCreator<ExplorationSlice> = (
  set
) => ({
  explorationLevel: 1,
  currentXp: 0,
  addXp: (amount) => set((state) => ({ currentXp: state.currentXp + amount })),
  resetXp: () => set({ currentXp: 0 }),
  levelUp: () =>
    set((state) => ({
      explorationLevel: state.explorationLevel + 1,
    })),
});