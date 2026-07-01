// src/store/slices/villageSlice.ts
import type { StateCreator } from "zustand";
import type { GameState } from "../gameStore";
import {
  ADULT_AGE_IN_DAYS,
  FERTILE_AGE_END_IN_DAYS,
  type Villager,
} from "./villagersSlice";

// --- Definimos la forma de nuestros datos ---
export interface HouseInstance {
  id: number;
  buildingId: "HOUSE";
  ownerIds: [number | null, number | null]; // IDs de los dueños
  residentIds: number[];
}

export interface VillageSlice {
  houses: HouseInstance[];
  // Añadimos un contador para los IDs de las casas
  nextHouseId: number;

  // --- Acciones ---
  // Ahora solo necesitamos esta acción para añadir casas
  addConstructedHouse: (houseData: { buildingId: "HOUSE" }) => void;
  updateHousingAndRelocation: () => void; // Nueva acción para actualizar asignaciones
  addVillagerToHouse: (villagerId: number, houseId: number) => void;
  addOwnerToHouse: (villagerId: number, houseId: number) => void;
  removeInhabitant: (villagerId: number, houseId: number) => void;
}

// --- La implementación ---
export const createVillageSlice: StateCreator<
  GameState,
  [],
  [],
  VillageSlice
> = (set, get) => ({
  houses: [],
  nextHouseId: 1, // Empezamos con el ID 1
  housingAssignments: {},

  addConstructedHouse: (houseData) => {
    const newHouseId = get().nextHouseId;
    const newHouse: HouseInstance = {
      id: newHouseId,
      buildingId: houseData.buildingId,
      ownerIds: [null, null], // Inicialmente sin dueños
      residentIds: [],
    };

    // Actualizamos el estado AÑADIENDO la casa y incrementando el próximo ID
    set((state) => ({
      houses: [...state.houses, newHouse],
      nextHouseId: state.nextHouseId + 1,
    }));
  },

  updateHousingAndRelocation: () => {
    const {
      villagers,
      houses,
      removeInhabitant,
      addOwnerToHouse,
      addVillagerToHouse,
    } = get();

    // 1. IDENTIFICAR BUSCADORES: Adultos que no son dueños de ninguna casa.
    const seekers = villagers.filter((v) => {
      if (v.age < ADULT_AGE_IN_DAYS) return false;

      const isOwner = houses.some((h) => h.ownerIds.includes(v.id));
      return !isOwner;
    });

    if (seekers.length === 0) return; // No hay nadie buscando casa.

    // 2. PROCESAR BUSCADORES
    for (const seeker of seekers) {
      // Determinamos si el buscador vivía en algún sitio (ej. casa de sus padres)
      const originalHouse = houses.find(
        (h) =>
          h.ownerIds.includes(seeker.id) || h.residentIds.includes(seeker.id)
      );

      // 3. LÓGICA DE BÚSQUEDA SECUENCIAL Y SIMPLIFICADA

      // P1: Encontrar casa con 1 dueño del sexo opuesto para emparejarse.
      let targetHouse = findHouseWithEligiblePartner(seeker, get());
      if (targetHouse) {
        if (originalHouse) removeInhabitant(seeker.id, originalHouse.id);
        addOwnerToHouse(seeker.id, targetHouse.id);
        continue; // Aldeano alojado, vamos al siguiente.
      }

      // P2: Encontrar una casa vacía para reclamarla como propia.
      targetHouse = findEmptyHouse(get());
      if (targetHouse) {
        if (originalHouse) removeInhabitant(seeker.id, originalHouse.id);
        addOwnerToHouse(seeker.id, targetHouse.id);
        continue; // Aldeano alojado, vamos al siguiente.
      }

      // P3: Encontrar una casa con 2 o más residentes que no son pareja y con espacio libre.
      targetHouse = findHouseWithNonTwoOwnersAndEligiblePartner(seeker, get());
      if (targetHouse) {
        if (originalHouse) removeInhabitant(seeker.id, originalHouse.id);
        addOwnerToHouse(seeker.id, targetHouse.id);
        continue; // Aldeano alojado, vamos al siguiente.
      }
      // P4: Encontrar una casa con 2 residentes que no son pareja y con espacio libre.
      targetHouse = findHouseWithNonTwoOwners(get());
      if (targetHouse) {
        if (originalHouse) removeInhabitant(seeker.id, originalHouse.id);
        addVillagerToHouse(seeker.id, targetHouse.id);
        continue; // Aldeano alojado, vamos al siguiente.
      }
      // P5: Encontrar una casa con una pareja y un ocupante adicional.
      targetHouse = findHouseWithCoupleAndStranger(get());
      if (targetHouse) {
        if (originalHouse) removeInhabitant(seeker.id, originalHouse.id);
        addVillagerToHouse(seeker.id, targetHouse.id);
        continue; // Aldeano alojado, vamos al siguiente.
      }
      // P6: Buscar una casa con un solo ocupante, sin importar sus características.
      targetHouse = findHouseWithSingleOccupant(get());
      if (targetHouse) {
        if (originalHouse) removeInhabitant(seeker.id, originalHouse.id);
        addVillagerToHouse(seeker.id, targetHouse.id);
        continue; // Aldeano alojado, vamos al siguiente.
      }
      targetHouse = findHouseWithRemainingSpace(get());
      // P7: Buscar una casa restante con espacio para un nuevo habitante.
      if (targetHouse) {
        if (originalHouse) removeInhabitant(seeker.id, originalHouse.id);
        addVillagerToHouse(seeker.id, targetHouse.id);
        continue; // Aldeano alojado, vamos al siguiente.
      }

    }
  },

  addVillagerToHouse: (villagerId: number, houseId: number) => {
    set((state) => ({
      houses: state.houses.map((h) =>
        h.id === houseId
          ? { ...h, residentIds: [...h.residentIds, villagerId] }
          : h
      ),
    }));
  },
  addOwnerToHouse: (villagerId: number, houseId: number) => {
    set((state) => ({
      houses: state.houses.map((h) =>
        h.id === houseId
          ? {
              ...h,
              ownerIds:
                h.ownerIds[0] === null
                  ? [villagerId, h.ownerIds[1]]
                  : h.ownerIds[1] === null
                  ? [h.ownerIds[0], villagerId]
                  : h.ownerIds, // Si ya hay dos dueños, no cambia nada
            }
          : h
      ),
    }));
  },

  /** Elimina a un habitante (dueño o hijo) de una casa. */
  removeInhabitant: (villagerId: number, houseId: number) => {
    set((state) => ({
      houses: state.houses.map((h) =>
        h.id === houseId
          ? {
              ...h,
              residentIds: h.residentIds.filter((id) => id !== villagerId),
            }
          : h
      ),
    }));
  },
});

// --- Funciones de búsqueda por prioridades ---
// Prioridad 1
function findHouseWithEligiblePartner(villager: Villager, state: GameState) {
    const singleOwnerHouses = state.houses.filter(h => {
    const realOwnersCount = h.ownerIds.filter(id => id !== null).length;
    return realOwnersCount === 1;
  });
  for (const house of singleOwnerHouses) {
    const ownerId = house.ownerIds.find(id => id !== null);
    const owner = state.villagers.find(v => v.id === ownerId);
    if (owner && isPotentialPartner(villager, owner)) {
      return house;
    }
  }
  return null;
}

// Prioridad 2
function findEmptyHouse(state: GameState) {
  return state.houses.find(h => {
    const realOwnersCount = h.ownerIds.filter(id => id !== null).length;
    return realOwnersCount === 0;
  }) || null;
}

/**
 * P3: Busca una casa con 2 o 3 residentes que no son pareja y con espacio libre y el dueño no es del mismo sexo.
 */
function findHouseWithNonTwoOwnersAndEligiblePartner(
  villager: Villager,
  state: GameState
): HouseInstance | null {
  // Filtramos casas que tengan 2 o más residentes en total y aún tengan espacio.
  const targetHouses = state.houses.filter((h) => {
    const realOwnersCount = h.ownerIds.filter((id) => id !== null).length;

    if (realOwnersCount === 2) return false; // No queremos casas con 2 dueños

    const totalResidents = realOwnersCount + h.residentIds.length;
    return totalResidents > 1 && totalResidents < 4;
  });

  for (const house of targetHouses) {
    const ownerId = house.ownerIds.find((id) => id !== null);
    const owner = ownerId
      ? state.villagers.find((v) => v.id === ownerId)
      : null;
    if (owner && isPotentialPartner(villager, owner)) {
      return house;
    }
  }
  return null;
}

// Prioridad 4
function findHouseWithNonTwoOwners(state: GameState): HouseInstance | null {
  // Filtramos casas que tengan 2 o más residentes en total y aún tengan espacio.
  const targetHouses = state.houses.find((h) => {
    const realOwnersCount = h.ownerIds.filter((id) => id !== null).length;
    if (realOwnersCount === 2) return false; // No queremos casas con 2 dueños
    const totalResidents = realOwnersCount + h.residentIds.length;
    return totalResidents > 1 && totalResidents < 4;
  });

  return targetHouses || null;
}

// Prioridad 5
function findHouseWithCoupleAndStranger(
  state: GameState
): HouseInstance | null {
  // Buscamos casas que tengan exactamente 3 habitantes.
  const targetHouses = state.houses.filter((h) => {
    const realOwnersCount = h.ownerIds.filter((id) => id !== null).length;
    if (realOwnersCount !== 2) return false; // Debe haber exactamente 2 dueños
    const totalInhabitants = realOwnersCount + h.residentIds.length;
    return totalInhabitants === 3;
  });

  for (const house of targetHouses) {
    const owners = house.ownerIds
      .map((id) => state.villagers.find((v) => v.id === id))
      .filter(Boolean) as Villager[];

    const residents = house.residentIds
      .map((id) => state.villagers.find((v) => v.id === id))
      .filter(Boolean) as Villager[];

    const stranger = residents[0];

    const isChild =
      stranger.genealogy?.parentId1 === owners[0].id ||
      stranger.genealogy?.parentId2 === owners[0].id;

    if (!isChild) {
      return house;
    }
  }

  return null; // No se encontró ninguna casa que cumpla estas condiciones.
}

// Prioridad 6
function findHouseWithSingleOccupant(state: GameState) {
  // Busca una casa con un solo ocupante, sin importar sus características (es el fallback de la prioridad 1)
  return state.houses.find(h => {
    const realOwnersCount = h.ownerIds.filter(id => id !== null).length;
    const totalInhabitants = realOwnersCount + h.residentIds.length;
    return totalInhabitants === 1;
  }) || null;
}

// Prioridad 7 Encontrar una casa restante con espacio para un nuevo habitante.
function findHouseWithRemainingSpace(state: GameState) {
  return state.houses.find(h => {
    const realOwnersCount = h.ownerIds.filter(id => id !== null).length;
    const totalInhabitants = realOwnersCount + h.residentIds.length;
    // La capacidad máxima de una casa es 4.
    return totalInhabitants < 4;
  }) || null;
}

function isPotentialPartner(villagerA: Villager, villagerB: Villager): boolean {
  const isFertileA =
    villagerA.age >= ADULT_AGE_IN_DAYS &&
    villagerA.age <= FERTILE_AGE_END_IN_DAYS;
  const isFertileB =
    villagerB.age >= ADULT_AGE_IN_DAYS &&
    villagerB.age <= FERTILE_AGE_END_IN_DAYS;

  return isFertileA && isFertileB && villagerA.sex !== villagerB.sex;
}

