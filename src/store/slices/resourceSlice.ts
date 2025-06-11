// src/store/slices/resourceSlice.ts

import type { StateCreator } from 'zustand';

// --- INTERFAZ PARA ESTE SLICE ---
export interface ResourceSlice {
  wood: number;
  food: number;
  stone: number;
  addWood: (amount: number) => void;
  // ... más acciones en el futuro
}

// --- CREACIÓN DEL SLICE ---
export const createResourceSlice: StateCreator<ResourceSlice> = (set) => ({
  wood: 0,
  food: 10, // Empezamos con algo de comida
  stone: 0,
  
  addWood: (amount) => set((state) => ({ wood: state.wood + amount })),
});