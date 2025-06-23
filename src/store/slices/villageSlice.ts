import type { StateCreator } from 'zustand';

// --- INTERFAZ PARA ESTE SLICE ---
export interface VillageSlice {
  villageName: string;
  // En el futuro: buildings, happiness, etc.
}

// --- CREACIÓN DEL SLICE ---
export const createVillageSlice: StateCreator<VillageSlice> = (/*set*/) => ({
  villageName: 'Asentamiento Inicial',
  // Aquí irá la lógica de los edificios y mejoras de la aldea.
});