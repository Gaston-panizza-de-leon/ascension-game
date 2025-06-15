// src/store/slices/resourceSlice.ts

import type { StateCreator } from 'zustand';

// --- INTERFAZ PARA ESTE SLICE ---
export interface ResourceSlice {
  wood: number;
  food: number;
  stone: number;
  addWood: (amount: number) => void;
  addFood: (amount: number) => void;
  // ... más acciones en el futuro
}

// --- CREACIÓN DEL SLICE ---
export const createResourceSlice: StateCreator<ResourceSlice> = (set) => ({
  wood: 0,
  food: 0,
  stone: 0,
  
  addWood: (amount) => set((state) => ({ wood: state.wood + amount })),
  addFood: (amount) => set((state) => ({ food: state.food + amount })),
});