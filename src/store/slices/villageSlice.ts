// src/store/slices/villageSlice.ts
import type { StateCreator } from 'zustand';
import type { GameState } from '../gameStore';
import { ADULT_AGE_IN_DAYS, FERTILE_AGE_END_IN_DAYS, type Villager } from './villagersSlice';

// --- Definimos la forma de nuestros datos ---
export interface HouseInstance {
  id: number;
  buildingId: 'HOUSE';
  residentIds: number[];
}

export interface VillageSlice {
  houses: HouseInstance[];
  // Añadimos un contador para los IDs de las casas
  nextHouseId: number;
  housingAssignments: Record<number, number[]>;

  // --- Acciones ---
  // Ahora solo necesitamos esta acción para añadir casas
  addConstructedHouse: (houseData: { buildingId: 'HOUSE' }) => void;
  assignVillagersToHouse: (houseId: number, villagerIds: number[]) => void;
  updateHousingAssignments: () => void; // Nueva acción para actualizar asignaciones
}

// --- La implementación ---
export const createVillageSlice: StateCreator<GameState, [], [], VillageSlice> = (set, get) => ({
  houses: [],
  nextHouseId: 1, // Empezamos con el ID 1
  housingAssignments: {},

  addConstructedHouse: (houseData) => {
    const newHouseId = get().nextHouseId;
    const newHouse: HouseInstance = {
      id: newHouseId,
      buildingId: houseData.buildingId,
      residentIds: [],
    };

    // Actualizamos el estado AÑADIENDO la casa y incrementando el próximo ID
    set((state) => ({
      houses: [...state.houses, newHouse],
      nextHouseId: state.nextHouseId + 1,
      housingAssignments: {
        ...state.housingAssignments,
        [newHouseId]: [],
      },
    }));
  },

  assignVillagersToHouse: (houseId, villagerIds) => {
    set((state) => ({
      housingAssignments: {
        ...state.housingAssignments,
        [houseId]: villagerIds, // Asignamos los aldeanos a la casa
      },
      houses: state.houses.map((h) =>
        h.id === houseId ? { ...h, residentIds: villagerIds.map(Number) } : h
      ),
    }));
  },

  updateHousingAssignments: () => {
    const { villagers, houses, assignVillagersToHouse } = get();

    const allResidentIds = new Set(Object.values(get().housingAssignments).flat());
    const homelessVillagers = villagers.filter(v =>
      !allResidentIds.has(v.id) && v.age >= ADULT_AGE_IN_DAYS
    );

    if (homelessVillagers.length === 0) return;

    for (const homeless of homelessVillagers) {
      let targetHouse = null;

      // --- ALGORITMO DE BÚSQUEDA POR PRIORIDADES ---

      // Prioridad 1: Encontrar pareja ideal.
      targetHouse = findHouseWithEligiblePartner(homeless, get());
      if (targetHouse) {
        const newResidents = [...get().housingAssignments[targetHouse.id], homeless.id];
        assignVillagersToHouse(targetHouse.id, newResidents);
        continue; // Aldeano alojado, pasamos al siguiente
      }

      // Prioridad 2: Encontrar casa vacía.
      targetHouse = findEmptyHouse(get());
      if (targetHouse) {
        assignVillagersToHouse(targetHouse.id, [homeless.id]);
        continue;
      }

      // Prioridad 3: Casa con 1 aldeano no-pareja.
      targetHouse = findHouseWithSingleOccupant(get());
      if (targetHouse) {
        const newResidents = [...get().housingAssignments[targetHouse.id], homeless.id];
        assignVillagersToHouse(targetHouse.id, newResidents);
        continue;
      }

      // Prioridad 4 a 8: "Apretujamiento" en casas con hueco.
      // Buscamos cualquier casa con menos de 4 personas, ordenadas por la que menos tenga.
      const housesWithSpace = houses
        .filter(h => get().housingAssignments[h.id].length < 4)
        .sort((a, b) => get().housingAssignments[a.id].length - get().housingAssignments[b.id].length);

      if (housesWithSpace.length > 0) {
        targetHouse = housesWithSpace[0]; // La que tenga menos gente
        const newResidents = [...get().housingAssignments[targetHouse.id], homeless.id];
        assignVillagersToHouse(targetHouse.id, newResidents);
        continue;
      }
    }
  },
  optimizeAndRelocateVillagers: () => {
    const housedVillagers = get().villagers.filter(v =>
      v.age >= ADULT_AGE_IN_DAYS && get().houses.some(h => h.residentIds.includes(v.id))
    );
    const unhappySeekers = housedVillagers.filter(villager => {
      const currentHouse = get().houses.find(h => h.residentIds.includes(villager.id));
      // Necesitamos esta función auxiliar que determine si la situación es mala
      return isSituationSuboptimal(villager, currentHouse, get());
    });
  },
});

// --- Funciones de búsqueda por prioridades ---
// Prioridad 1
function findHouseWithEligiblePartner(villager: Villager, state: GameState) {
  const singleOccupantHouses = state.houses.filter(h => state.housingAssignments[h.id].length === 1);
  for (const house of singleOccupantHouses) {
    const resident = state.villagers.find(v => v.id === state.housingAssignments[house.id][0]);
    if (
      resident &&
      resident.age >= ADULT_AGE_IN_DAYS && resident.age <= FERTILE_AGE_END_IN_DAYS &&
      resident.sex !== villager.sex
    ) {
      return house;
    }
  }
  return null;
}

// Prioridad 2
function findEmptyHouse(state: GameState) {
  return state.houses.find(h => state.housingAssignments[h.id].length === 0) || null;
}

// Prioridad 3
function findHouseWithSingleOccupant(state: GameState) {
  // Busca una casa con un solo ocupante, sin importar sus características (es el fallback de la prioridad 1)
  return state.houses.find(h => state.housingAssignments[h.id].length === 1) || null;
}

function isSituationSuboptimal(villager: Villager, currentHouse: HouseInstance | undefined, arg2: GameState): unknown {
  throw new Error('Function not implemented.');
}
