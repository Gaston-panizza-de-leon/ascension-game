import type { StateCreator } from "zustand";
import type { GameState } from "../gameStore";
import { faker } from "@faker-js/faker/locale/es";

// --- TIPOS (Exportados para que otros slices los usen) ---
export type TaskType = "exploration" | "wood" | "food" | "construction";

export interface VillagerTask {
  type: TaskType;
  targetId?: number;
}

export interface Villager {
  id: number;
  name: string;
  assignedTask: VillagerTask | null;
  sex: "male" | "female";
  origin: 'found' | 'born';
  discoveryDay?: number;
}

// --- INTERFAZ DEL SLICE ---
export interface VillagersSlice {
  villagers: Villager[];
  lastFoodConsumptionDay: number;
  discoverNewVillager: () => void;
  assignTaskToVillager: (villagerId: number, task: VillagerTask | null) => void;
  unassignVillagersByTask: (task: VillagerTask) => void;
  processVillagerNeeds: () => void;
}

// --- CREACIÓN DEL SLICE ---
export const createVillagersSlice: StateCreator<
  GameState,
  [],
  [],
  VillagersSlice
> = (set, get) => ({
  villagers: [],
  lastFoodConsumptionDay: 0,
  discoverNewVillager: () => {
    const setSetx = faker.person.sex() === "male" ? "male" : "female";
    set((state) => {
      const newVillager: Villager = {
        id: state.villagers.length + 1,
        assignedTask: null,
        sex: setSetx,
        name: faker.person.firstName(setSetx),
        origin: "found",
        discoveryDay: get().currentDay,
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
  processVillagerNeeds: () => {
    const { currentDay, villagers, consumeFood } =
      get();
    let lastConsumption = get().lastFoodConsumptionDay;

    while (currentDay >= lastConsumption + 7) {
      const consumptionDay = lastConsumption + 7;

      const eatingVillagers = villagers.filter(
        (v) => {
          if (v.origin === 'born') {
            return true;
          }
          if (v.origin === 'found' && typeof v.discoveryDay === 'number') {
            return consumptionDay > v.discoveryDay + 7;
          }
          return false;
        }
      );
      const foodToConsume = eatingVillagers.length * 5;

      if (foodToConsume > 0) {
        console.log(
          `[VILLAGERS_SLICE]: Día ${consumptionDay}. ${eatingVillagers.length} de ${villagers.length} aldeanos consumen ${foodToConsume} de comida.`
        );
        consumeFood(foodToConsume);
      }

      // Actualizamos el día de consumo para la siguiente posible iteración del bucle.
      lastConsumption += 7;
      set({ lastFoodConsumptionDay: lastConsumption });
    }
  },
});
