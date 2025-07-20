import type { StateCreator } from "zustand";
import type { GameState } from "../gameStore";

export const DAY_DURATION_MS = 10000; // 10 segundos por día por defecto
export const DAYS_PER_YEAR = 48; // 48 días por año

export interface TimeSlice {
  currentDay: number;
  timeOfDayProgress: number; // Un valor de 0 a 1 que representa el % del día transcurrido
  advanceTime: (deltaTime: number) => number;
}

export const createTimeSlice: StateCreator<GameState, [], [], TimeSlice> = (
  set,
  get
) => ({
  currentDay: 1,
  timeOfDayProgress: 0,
  advanceTime: (deltaTime: number) => {
    
    const newTotalProgress =
      get().timeOfDayProgress + deltaTime / DAY_DURATION_MS;

    const daysPassed = Math.floor(newTotalProgress);

    set((state) => ({
      currentDay: state.currentDay + daysPassed,
      timeOfDayProgress: newTotalProgress % 1,
    }));
    return daysPassed;
  },
});
