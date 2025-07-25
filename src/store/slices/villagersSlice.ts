import type { StateCreator } from "zustand";
import type { GameState } from "../gameStore";
import { faker } from "@faker-js/faker/locale/es";
import { DAYS_PER_YEAR } from "./timeSlice";

// --- CONSTANTES ---
export const ADULT_AGE_IN_DAYS = 16 * DAYS_PER_YEAR; // = 768 días de juego
export const FERTILE_AGE_END_IN_DAYS = 40 * DAYS_PER_YEAR; // = 1920 días de juego
export const REPRODUCTION_CHANCE_PER_DAY = 0.05; // 5% de probabilidad de reproducción diaria
export const MORTALITY_START_AGE_DAYS = 50 * DAYS_PER_YEAR; // 50 años * 48 días/año
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
    set((state) => {

      const nextVillagers: Villager[] = [];
      // --- Constantes de tu fórmula ---
      const C1 = 0.00031763;
      const C2 = 0.00000443;
      const C3 = 0.00021411;
      // --------------------------------

      for (const villager of state.villagers) {
        // 1. Todos los aldeanos envejecen un día.
        const newAge = villager.age + 1;
        let willSurvive = true;

        // 2. Comprobamos si el aldeano está en el rango de edad mortal.
        if (newAge >= MORTALITY_START_AGE_DAYS) {
          // 3. Calculamos 'n': los días que han pasado desde que cumplió 50.
          const n = newAge - MORTALITY_START_AGE_DAYS;

          // 4. Aplicamos tu fórmula para calcular la probabilidad de muerte de HOY.
          //    (Añadimos una guarda para evitar la división por cero el primer día)
          if (n > 0) {
            const mortalityChanceToday = C1 + C2 * n - C3 / (n * n);

            // 5. Tiramos el dado.
            if (Math.random() < mortalityChanceToday) {
              willSurvive = false;
              // Aquí puedes añadir una notificación al jugador si quieres.
              // console.log(`${villager.name} ha muerto de vejez a los ${Math.floor(newAge / 48)} años.`);
            }
          }
        }

        // 6. Si el aldeano sobrevive, pasa a la lista del día siguiente.
        if (willSurvive) {
          nextVillagers.push({ ...villager, age: newAge });
        }
      }

      // 7. Actualizamos el estado con la lista final de aldeanos vivos.
      return { villagers: nextVillagers };
    });
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
    const { houses, villagers, createChildVillager, addVillagerToHouse } =
      get();

    // Iteramos sobre cada casa para ver si es un hogar "fértil"
    for (const house of houses) {
      // --- APLICAMOS LAS REGLAS ---
      const realOwnersCount = house.ownerIds.filter((id) => id !== null).length;
      // Regla 1: ¿Hay espacio para un niño? (Capacidad máxima de 4)
      if (house.residentIds.length + realOwnersCount >= 4) {
        continue; // La casa está llena, pasamos a la siguiente.
      }

      // Regla 2: ¿Hay una pareja de adultos solos?
      if (house.residentIds.length === 0 && realOwnersCount === 2) {
        const resident1 = villagers.find((v) => v.id === house.ownerIds[0]);
        const resident2 = villagers.find((v) => v.id === house.ownerIds[1]);

        // Comprobamos que ambos residentes existan y sean una pareja de adultos
        if (
          resident1 &&
          resident2 &&
          resident1.age < FERTILE_AGE_END_IN_DAYS &&
          resident2.age < FERTILE_AGE_END_IN_DAYS
        ) {
          if (Math.random() < REPRODUCTION_CHANCE_PER_DAY) {
            // Creamos el niño
            const child = createChildVillager({
              parentId1: resident1.id,
              parentId2: resident2.id,
            });
            addVillagerToHouse(child.id, house.id);
          }
        }
      } else if (house.residentIds.length === 1 && realOwnersCount === 2) {
        // Regla 3: ¿Hay una pareja de adultos con UN hijo suyo?
        const residents = villagers.filter((v) =>
          house.residentIds.includes(v.id)
        );

        const owners = house.ownerIds
          .map((id) => villagers.find((v) => v.id === id))
          .filter(Boolean) as Villager[];

        const children = residents.filter((r) => r.age < ADULT_AGE_IN_DAYS);

        // Verificamos que la composición sea correcta: 2 adultos y 1 niño
        if (children.length === 1) {
          const [parent1, parent2] = owners;
          const child = children[0];

          // Verificamos que el niño sea suyo
          if (
            child.genealogy?.parentId1 === parent1.id &&
            child.genealogy?.parentId2 === parent2.id &&
            parent1.age < FERTILE_AGE_END_IN_DAYS &&
            parent2.age < FERTILE_AGE_END_IN_DAYS
          ) {
            if (Math.random() < REPRODUCTION_CHANCE_PER_DAY) {
              const newChild = createChildVillager({
                parentId1: parent1.id,
                parentId2: parent2.id,
              });

              addVillagerToHouse(newChild.id, house.id);
            }
          }
        }
      }
    }
  },
});
