import type { StateCreator } from 'zustand';
import type { GameState } from '../gameStore';
import type { VillagerTask } from './villagersSlice';

export interface PlayerSlice {
  playerTask: VillagerTask | null;
  setPlayerTask: (task: VillagerTask | null) => void;
}

export const createPlayerSlice: StateCreator<GameState, [], [], PlayerSlice> = (
  set,
  get
) => ({
  playerTask: null,

  setPlayerTask: (task) => {
    // Validación: El jugador no puede hacer una tarea de árbol si ya hay un aldeano.
    if (task && task.type !== 'exploration') {
      const isTaskOccupiedByVillager = get().villagers.some(
        (v) =>
          v.assignedTask?.type === task.type &&
          v.assignedTask?.targetId === task.targetId
      );
      if (isTaskOccupiedByVillager) {
        console.warn(
          `El jugador no puede trabajar en el árbol #${task.targetId} porque ya está ocupado por un aldeano.`
        );
        return; // Detiene la acción
      }
    }
    
    // Asigna la tarea al jugador
    set({ playerTask: task });
  },
});