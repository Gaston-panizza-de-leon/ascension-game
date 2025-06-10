// src/store/gameStore.ts
import { create } from 'zustand';

// 1. Definimos la "forma" que tendrá nuestro estado y nuestras acciones
interface GameState {
  // --- ESTADO ---
  explorationLevel: number;
  currentXp: number;
  isExploring: boolean;

  // --- ACCIONES ---
  setExploring: (isExploring: boolean) => void;
  addXp: (amount: number) => void;
  levelUp: () => void;
  resetXp: () => void;
}

// 2. Creamos el store con create() de Zustand
export const useGameStore = create<GameState>((set) => ({
  // --- VALORES INICIALES DEL ESTADO ---
  explorationLevel: 1,
  currentXp: 0,
  isExploring: false,

  // --- IMPLEMENTACIÓN DE LAS ACCIONES ---
  // set() es la función que usamos para modificar el estado
  setExploring: (exploring) => set({ isExploring: exploring }),

  addXp: (amount) => set((state) => ({ currentXp: state.currentXp + amount })),

  resetXp: () => set({ currentXp: 0 }),

  levelUp: () => set((state) => ({ 
    explorationLevel: state.explorationLevel + 1 
  })),
}));