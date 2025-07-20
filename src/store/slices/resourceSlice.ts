// src/store/slices/resourceSlice.ts

import type { StateCreator } from "zustand";

// --- INTERFAZ PARA ESTE SLICE ---
export interface ResourceSlice {
  wood: number;
  food: number;
  stone: number;
  addWood: (amount: number) => void;
  addFood: (amount: number) => void;
  consumeFood: (amountToConsume: number) => void;
  removeWood: (amount: number) => void;
  // ... más acciones en el futuro
}

// --- CREACIÓN DEL SLICE ---
export const createResourceSlice: StateCreator<ResourceSlice> = (set) => ({
  wood: 100,
  food: 100,
  stone: 100,

  addWood: (amount) => set((state) => ({ wood: state.wood + amount })),
  addFood: (amount) => set((state) => ({ food: state.food + amount })),

  consumeFood: (amountToConsume: number) => {
    set((state) => {
      const currentFood = state.food;
      // Nos aseguramos de que la comida no baje de 0
      const newFoodAmount = Math.max(0, currentFood - amountToConsume);
      return {
        food: newFoodAmount,
      };
    });
  },
  removeWood: (amount: number) => {
    set((state) => ({
      wood: Math.max(0, state.wood - amount),
    }));
  },
});
