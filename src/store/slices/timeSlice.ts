import type { StateCreator } from 'zustand';
import type { GameState } from '../gameStore';

export const DAY_DURATION_MS = 10000; // 10 segundos por día por defecto

export interface TimeSlice {
  currentDay: number;
  timeOfDayProgress: number; // Un valor de 0 a 1 que representa el % del día transcurrido
  advanceTime: (deltaTime: number) => void;
}

export const createTimeSlice: StateCreator<GameState, [], [], TimeSlice> = (set, get) => ({
  currentDay: 1,
  timeOfDayProgress: 0,
  advanceTime: (deltaTime: number) => {
    const newProgress = get().timeOfDayProgress + (deltaTime / DAY_DURATION_MS);

    if (newProgress >= 1) {
      const daysPassed = Math.floor(newProgress);
      set((state) => ({
        currentDay: state.currentDay + daysPassed,
        timeOfDayProgress: newProgress % 1, // Reseteamos el progreso, guardando el sobrante
      }));
    } else {
      set({ timeOfDayProgress: newProgress });
    }
  },
});