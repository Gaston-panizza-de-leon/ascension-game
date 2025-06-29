import type { StateCreator } from "zustand";
import type { GameState } from "../gameStore";
import { faker } from "@faker-js/faker/locale/es";

// --- TIPOS (Exportados para que otros slices los usen) ---
export type TaskType = "exploration" | "wood" | "food";

export interface VillagerTask {
  type: TaskType;
  targetId?: number;
}

export interface Villager {
  id: number;
  name: string;
  assignedTask: VillagerTask | null;
  sex: "male" | "female";
}

// --- INTERFAZ DEL SLICE ---
export interface VillagersSlice {
  villagers: Villager[];
  discoverNewVillager: () => void;
  assignTaskToVillager: (villagerId: number, task: VillagerTask | null) => void;
  unassignVillagersByTask: (task: VillagerTask) => void;
}

// --- CREACIÓN DEL SLICE ---
export const createVillagersSlice: StateCreator<
  GameState,
  [],
  [],
  VillagersSlice
> = (set, get) => ({
  villagers: [],

  discoverNewVillager: () => {
    const setSetx = faker.person.sex() === "male" ? "male" : "female";
    set((state) => {
      const newVillager: Villager = {
        id: state.villagers.length + 1,
        assignedTask: null,
        sex: setSetx,
        name: faker.person.firstName(setSetx),
      };
      return { villagers: [...state.villagers, newVillager] };
    });
  },

  assignTaskToVillager: (villagerId, task) => {
    // Validación: Un aldeano no puede hacer una tarea de árbol si el jugador ya está ahí.
    if (task && task.type !== "exploration") {
      const playerTask = get().playerTask;
      if (
        playerTask?.type === task.type &&
        playerTask?.targetId === task.targetId
      ) {
        console.warn(
          `Un aldeano no puede trabajar en el árbol #${task.targetId} porque el jugador ya está trabajando ahí.`
        );
        return;
      }
    }

    set((state) => ({
      villagers: state.villagers.map((villager) =>
        villager.id === villagerId
          ? { ...villager, assignedTask: task }
          : villager
      ),
    }));
  },

  unassignVillagersByTask: (task) => {
    set((state) => ({
      villagers: state.villagers.map((v) => {
        if (
          v.assignedTask?.type === task.type &&
          v.assignedTask?.targetId === task.targetId
        ) {
          return { ...v, assignedTask: null };
        }
        return v;
      }),
    }));
  },
});
