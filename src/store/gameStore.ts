// src/store/gameStore.ts

import { create } from 'zustand';
import { type ExplorationSlice, createExplorationSlice, calculateXpForLevel } from './slices/explorationSlice';
import { type ResourceSlice, createResourceSlice } from './slices/resourceSlice';

// --- CONSTANTES GLOBALES (SI LAS HAY) ---
const XP_GAIN_PER_SECOND = 1;

// --- TIPO GLOBAL DEL STORE (LA UNIÓN DE TODOS LOS SLICES) ---
type GameState = ExplorationSlice & ResourceSlice;

// --- CREACIÓN DEL STORE ENSAMBLANDO LOS SLICES ---
export const useGameStore = create<GameState>()((...a) => ({
  ...createExplorationSlice(...a),
  ...createResourceSlice(...a),
}));

// ====================================================================
// MOTOR DEL JUEGO: Sigue viviendo aquí porque puede necesitar
// coordinar lógicas entre diferentes slices en el futuro.
// ====================================================================
useGameStore.subscribe((state, prevState) => {
  const { getState, setState } = useGameStore;

  // --- GESTIÓN DEL INTERVALO DE EXPLORACIÓN ---
  if (state.isExploring && !prevState.isExploring) {
    if (state.intervalId) clearInterval(state.intervalId);
    const newIntervalId = window.setInterval(() => {
      const xpGained = (100 / 1000) * XP_GAIN_PER_SECOND;
      getState().addXp(xpGained);
    }, 100);
    setState({ intervalId: newIntervalId });
  }

  if (!state.isExploring && prevState.isExploring) {
    if (state.intervalId) {
      clearInterval(state.intervalId);
      setState({ intervalId: null });
    }
  }

  // --- GESTIÓN DE SUBIDA DE NIVEL ---
  const totalXpForLevel = calculateXpForLevel(state.explorationLevel);

  if (state.currentXp >= totalXpForLevel) {
    const excessXp = state.currentXp - totalXpForLevel;
    getState().levelUp();
    getState().resetXp();
    getState().addXp(excessXp);
    console.log(`¡NIVEL DE EXPLORACIÓN COMPLETADO! Nuevo nivel: ${getState().explorationLevel}`);
  }
});