import type { StateCreator } from "zustand";
import type { GameState } from "../gameStore";
import { faker } from "@faker-js/faker/locale/es";
import { DAYS_PER_YEAR } from "./timeSlice";

// --- CONSTANTES ---
export const ADULT_AGE_IN_DAYS = 16 * DAYS_PER_YEAR; // = 768 días de juego
export const FERTILE_AGE_END_IN_DAYS = 40 * DAYS_PER_YEAR; // = 1920 días de juego
export const REPRODUCTION_CHANCE_PER_DAY = 0.1; // 10% de probabilidad de reproducción diaria
// --- TIPOS (Exportados para que otros slices los usen) ---
export type TaskType = "exploration" | "wood" | "food" | "construction";

export interface VillagerTask {
  type: TaskType;
  targetId?: number;
}

export interface VillagerGenealogy {
  parentId1: number;
  parentId2: number;
}

export interface Villager {
  id: number;
  name: string;
  assignedTask: VillagerTask | null;
  sex: "male" | "female";
  age: number;
  origin: "found" | "born";
  discoveryDay?: number; // Solo si es de origen 'found'
  genealogy?: VillagerGenealogy; // Solo si es de origen 'born'
}

// --- INTERFAZ DEL SLICE ---
export interface VillagersSlice {
  villagers: Villager[];
  lastFoodConsumptionDay: number;
  discoverNewVillager: () => void;
  assignTaskToVillager: (villagerId: number, task: VillagerTask | null) => void;
  unassignVillagersByTask: (task: VillagerTask) => void;
  processVillagerNeeds: () => void;
  processAging: () => void;
  createChildVillager: (genealogy: VillagerGenealogy) => Villager; // Nueva función para procesar el envejecimiento
  processReproduction: () => void;
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
        age: 18 * DAYS_PER_YEAR,
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
    const { currentDay, villagers, consumeFood } = get();
    let lastConsumption = get().lastFoodConsumptionDay;

    while (currentDay >= lastConsumption + 7) {
      const consumptionDay = lastConsumption + 7;

      const eatingVillagers = villagers.filter((v) => {
        if (v.origin === "born") {
          return true;
        }
        if (v.origin === "found" && typeof v.discoveryDay === "number") {
          return consumptionDay > v.discoveryDay + 7;
        }
        return false;
      });
      const foodToConsume = eatingVillagers.length * 5;

      if (foodToConsume > 0) {
        consumeFood(foodToConsume);
      }

      // Actualizamos el día de consumo para la siguiente posible iteración del bucle.
      lastConsumption += 7;
      set({ lastFoodConsumptionDay: lastConsumption });
    }
  },

  processAging: () => {
    set((state) => ({
      villagers: state.villagers.map((villager) => ({
        ...villager,
        age: villager.age + 1,
      })),
    }));
  },

  createChildVillager: (genealogy) => {
    const setSetx = faker.person.sex() === "male" ? "male" : "female";

    const newChild: Villager = {
      id: get().villagers.length + 1,
      name: faker.person.firstName(setSetx),
      sex: setSetx,
      assignedTask: null,
      origin: "born", // Su origen es por nacimiento
      age: 0, // Nace con 0 días de edad
      genealogy: genealogy, // Guardamos quiénes son sus padres
    };

    set((state) => ({
      villagers: [...state.villagers, newChild],
    }));

    // Devolvemos el niño recién creado para que otros slices puedan usarlo
    return newChild;
  },

  processReproduction: () => {
    const { houses, villagers, createChildVillager, assignVillagersToHouse } =
      get();

    // Iteramos sobre cada casa para ver si es un hogar "fértil"
    for (const house of houses) {
      // --- APLICAMOS LAS REGLAS ---

      // Regla 1: ¿Hay espacio para un niño? (Capacidad máxima de 4)
      if (house.residentIds.length >= 4) {
        continue; // La casa está llena, pasamos a la siguiente.
      }

      // Regla 2: ¿Hay una pareja de adultos solos?
      if (house.residentIds.length === 2) {
        const resident1 = villagers.find((v) => v.id === house.residentIds[0]);
        const resident2 = villagers.find((v) => v.id === house.residentIds[1]);

        // Comprobamos que ambos residentes existan y sean una pareja de adultos
        if (
          resident1 &&
          resident2 &&
          resident1.age >= ADULT_AGE_IN_DAYS &&
          resident2.age >= ADULT_AGE_IN_DAYS &&
          resident1.sex !== resident2.sex
        ) {
          // ¡Condiciones cumplidas! Tiramos el dado.
          if (Math.random() < REPRODUCTION_CHANCE_PER_DAY) {
            // Creamos el niño
            const child = createChildVillager({
              parentId1: resident1.id,
              parentId2: resident2.id,
            });

            // Añadimos al niño a la casa
            const newResidentIds = [...house.residentIds, child.id];
            assignVillagersToHouse(house.id, newResidentIds);
          }
        }
      } else if (house.residentIds.length === 3) {
        // Regla 3: ¿Hay una pareja de adultos con UN hijo suyo?
        const residents = house.residentIds.map((id) =>
          villagers.find((v) => v.id === id)
        ).filter(Boolean) as Villager[];

        const adults = residents.filter((r) => r.age >= ADULT_AGE_IN_DAYS);
        const children = residents.filter((r) => r.age < ADULT_AGE_IN_DAYS);

        // Verificamos que la composición sea correcta: 2 adultos y 1 niño
        if (adults.length === 2 && children.length === 1) {
          const [parent1, parent2] = adults;
          const child = children[0];

          // Verificamos que el niño sea suyo
          if (
            child.genealogy?.parentId1 === parent1.id &&
            child.genealogy?.parentId2 === parent2.id
          ) {
            // ¡Condiciones cumplidas para el segundo hijo! Tiramos el dado.
            if (Math.random() < REPRODUCTION_CHANCE_PER_DAY) {
              // Podríamos usar una probabilidad menor si quisiéramos

              const newChild = createChildVillager({
                parentId1: parent1.id,
                parentId2: parent2.id,
              });
              const newResidentIds = [...house.residentIds, newChild.id];
              assignVillagersToHouse(house.id, newResidentIds);
            }
          }
        }
      }
    }
  },
  
});

