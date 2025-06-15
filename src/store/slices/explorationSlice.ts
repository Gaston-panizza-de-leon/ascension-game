// src/store/slices/explorationSlice.ts

import type { StateCreator } from 'zustand';
import type { GameState } from '../gameStore';

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
export const createExplorationSlice: StateCreator<
  GameState,
  [],
  [],
  ExplorationSlice
> = (set, get) => ({
  explorationLevel: 1,
  currentXp: 0,
  isExploring: false,
  intervalId: null,

    setExploring: (exploring) => {
    // ====================================================================
    // CAMBIO CLAVE: Lógica de exclusividad de tarea
    // ====================================================================
    // Si vamos a EMPEZAR a explorar...
    if (exploring) {
      // ...reseteamos todas las tareas de los árboles.
      const resetTrees = get().trees.map(tree => ({
        ...tree,
        assignedTask: null,
        progress: 0
      }));

      // Actualizamos el estado de exploración Y el de los árboles a la vez
      set({ isExploring: true, trees: resetTrees });
    } else {
      // Si solo estamos parando de explorar, no hacemos nada más.
      set({ isExploring: false });
    }
  },
  
  addXp: (amount) => set((state) => ({ currentXp: state.currentXp + amount })),
  resetXp: () => set({ currentXp: 0 }),
  levelUp: () => set((state) => ({ 
    explorationLevel: state.explorationLevel + 1 
  })),
  setIntervalId: (id) => set({ intervalId: id }),
});