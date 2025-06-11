// src/store/slices/explorationSlice.ts

import type { StateCreator } from 'zustand';

// --- LÓGICA Y CONSTANTES DE ESTE SLICE ---
const BASE_XP_REQUIRED = 5;
const XP_MULTIPLIER = 1.1;

export const calculateXpForLevel = (level: number): number => {
  return BASE_XP_REQUIRED * Math.pow(XP_MULTIPLIER, level - 1);
};

// --- INTERFAZ PARA ESTE SLICE ---
// Define la forma de esta "rebanada" del estado
export interface ExplorationSlice {
  explorationLevel: number;
  currentXp: number;
  isExploring: boolean;
  intervalId: number | null;
  
  setExploring: (isExploring: boolean) => void;
  addXp: (amount: number) => void;
  levelUp: () => void;
  resetXp: () => void;
  setIntervalId: (id: number | null) => void;
}

// --- CREACIÓN DEL SLICE ---
// Es una función que recibe `set` y `get` (de Zustand) y devuelve el objeto del slice.
// Usamos `StateCreator` para el tipado, que nos ayuda a componer slices.
export const createExplorationSlice: StateCreator<ExplorationSlice> = (set) => ({
  explorationLevel: 1,
  currentXp: 0,
  isExploring: false,
  intervalId: null,

  setExploring: (exploring) => set({ isExploring: exploring }),
  addXp: (amount) => set((state) => ({ currentXp: state.currentXp + amount })),
  resetXp: () => set({ currentXp: 0 }),
  levelUp: () => set((state) => ({ 
    explorationLevel: state.explorationLevel + 1 
  })),
  setIntervalId: (id) => set({ intervalId: id }),
});