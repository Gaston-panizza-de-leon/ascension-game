import { create } from "zustand";
import { type ExplorationSlice, createExplorationSlice, calculateXpForLevel } from "./slices/explorationSlice";
import { type ResourceSlice, createResourceSlice, } from "./slices/resourceSlice";
import { type EnvironmentSlice, createEnvironmentSlice } from "./slices/environmentSlice";
import { type VillageSlice, createVillageSlice } from "./slices/villageSlice";
import { type VillagersSlice, createVillagersSlice } from "./slices/villagersSlice";
import { type PlayerSlice, createPlayerSlice } from "./slices/playerSlice";
import { type TimeSlice, createTimeSlice, DAY_DURATION_MS } from './slices/timeSlice';
import { type BuildingsSlice, createBuildingsSlice } from "./slices/buildingsSlice";
import buildingBlueprints from '../data/buildings.json';

// --- CONSTANTES ---
const XP_GAIN_PER_UNIT = 1000; // La ganancia de XP
const WOOD_CYCLE_DAYS = 0.5;
const FOOD_CYCLE_DAYS = 1;
const POPULATION_PER_HOUSE = 4;

// --- TIPO GLOBAL ---
export type GameState = ExplorationSlice & ResourceSlice & EnvironmentSlice & VillageSlice & VillagersSlice & PlayerSlice & TimeSlice & BuildingsSlice & {
  lastTickTimestamp: number;
  isLoopRunning: boolean;
  setLoopRunning: (isRunning: boolean) => void;
  setLastTickTimestamp: (ts: number) => void;
  getPopulationCapacity: () => number;
};

// --- CREACIÓN DEL STORE ---
export const useGameStore = create<GameState>()((...a) => ({
  ...createExplorationSlice(...a),
  ...createResourceSlice(...a),
  ...createEnvironmentSlice(...a),
  ...createVillageSlice(...a),
  ...createVillagersSlice(...a),
  ...createPlayerSlice(...a),
  ...createTimeSlice(...a),
  ...createBuildingsSlice(...a),
  lastTickTimestamp: 0,
  isLoopRunning: false,
  setLoopRunning: (isRunning) => a[0]({ isLoopRunning: isRunning }),
  setLastTickTimestamp: (ts) => a[0]({ lastTickTimestamp: ts }),
  getPopulationCapacity: () => getPopulationCapacity(),
}));

function processConstruction(deltaTime: number) {
  const { activeConstruction, villagers, advanceConstruction } = useGameStore.getState();

  // Si no hay nada que construir, no hacemos nada.
  if (!activeConstruction) return;

  // Contamos cuántos aldeanos están asignados a la construcción.
  const constructionWorkers = villagers.filter(v => v.assignedTask?.type === 'construction');

  // Si no hay trabajadores, el progreso no avanza.
  if (constructionWorkers.length === 0) return;

  // Calculamos el poder de construcción total.
  const totalBuildingPower = constructionWorkers.reduce((sum, worker) => {
    return sum + worker.productivityModifier;
  }, 0);

  if (totalBuildingPower === 0) return; // Si no hay productividad, no avanzamos

  // Buscamos la plantilla del edificio para obtener su tiempo de construcción base.
  const blueprint = buildingBlueprints.find(b => b.id === activeConstruction.buildingId);
  if (!blueprint) return; // Seguridad por si no se encuentra la plantilla

  // --- El cálculo de progreso ---
  const baseTimeInDays = blueprint.baseConstructionTime;
  const progressPerDay = 100 / baseTimeInDays;
  const fractionOfDayPassed = deltaTime / DAY_DURATION_MS;

  // El progreso ganado es proporcional al número de trabajadores.
  const progressGained = fractionOfDayPassed * progressPerDay * totalBuildingPower;

  // Llamamos a la acción del slice para que actualice el estado.
  advanceConstruction(progressGained);
}

export const getPopulationCapacity = (): number => {
  const state = useGameStore.getState();
  const houseCount = state.houses.length || 0;
  return houseCount * POPULATION_PER_HOUSE;
};

// --- MOTOR DEL JUEGO UNIFICADO ---
const gameLoop = (timestamp: number) => {
  const { getState } = useGameStore;
  const state = getState();
  if (!state.isLoopRunning) return;

  const deltaTime = timestamp - state.lastTickTimestamp;
  getState().setLastTickTimestamp(timestamp);
  const { advanceTime } = getState();

  // --- LÓGICA DE EXPLORACIÓN UNIFICADA ---
  const isPlayerExploring = state.playerTask?.type === 'exploration';

  // 1. Obtenemos la lista de aldeanos que están explorando.
  const explorationVillagers = state.villagers.filter(v => v.assignedTask?.type === 'exploration');

  // 2. Sumamos su productividad real para obtener el "Poder de Exploración".
  const totalVillagerExplorationPower = explorationVillagers.reduce((sum, villager) => {
    return sum + villager.productivityModifier;
  }, 0);

  // 3. El esfuerzo total ahora incluye la eficiencia de los aldeanos.
  const totalExplorationEffort = (isPlayerExploring ? 1 : 0) + totalVillagerExplorationPower;

  if (totalExplorationEffort > 0) {
    const xpGained = (deltaTime / 1000) * XP_GAIN_PER_UNIT * totalExplorationEffort;
    state.addXp(xpGained);
  }

  // --- LÓGICA DE RECURSOS UNIFICADA ---
  state.trees.forEach((tree) => {
    const isPlayerWorkingHere = state.playerTask?.targetId === tree.id;
    const villagerWorker = state.villagers.find(v => v.assignedTask?.targetId === tree.id);

    if (isPlayerWorkingHere || villagerWorker) {
      const workerTask = isPlayerWorkingHere ? state.playerTask! : villagerWorker!.assignedTask!;

      let gatheringPower = 0;
      if (isPlayerWorkingHere) {
        gatheringPower = 1.0; // El jugador siempre tiene el 100% de productividad.
      } else if (villagerWorker) {
        gatheringPower = villagerWorker.productivityModifier;
      }

      if (gatheringPower > 0) {
        const cycleDuration = workerTask.type === 'wood' ? WOOD_CYCLE_DAYS : FOOD_CYCLE_DAYS;
        const progressPerDays = 100 / cycleDuration;

        // 2. El progreso ganado se multiplica por la potencia de recolección.
        const progressGained = (deltaTime / DAY_DURATION_MS) * progressPerDays * gatheringPower;
        const newProgress = tree.progress + progressGained;

        if (newProgress >= 100) {
          state.processTreeCycle(tree.id);
        } else {
          state.updateTreeProgress(tree.id, newProgress);
        }
      }

    } else if (tree.progress > 0) {
      state.updateTreeProgress(tree.id, 0);
    }
  });

  // --- LÓGICA DE SUBIDA DE NIVEL ---
  const totalXpForLevel = calculateXpForLevel(state.explorationLevel);
  if (state.currentXp >= totalXpForLevel) {
    const excessXp = state.currentXp - totalXpForLevel;
    const newLevel = state.explorationLevel + 1;
    getState().levelUp();
    getState().resetXp();
    getState().addXp(excessXp);
    if (newLevel % 4 === 0) getState().discoverNewTree();
    if (newLevel % 10 === 0) getState().discoverNewVillager();
  }
  const daysPassed = advanceTime(deltaTime);
  if (daysPassed > 0) {
    state.processFoodAndHunger();
    state.processAging();
    state.processReproduction();
    state.updateHousingAndRelocation();
    state.updateVillagerProductivity();
  }
  processConstruction(deltaTime);
  requestAnimationFrame(gameLoop);
};

useGameStore.subscribe((state) => {
  const { getState } = useGameStore;
  const shouldLoopRun = state.playerTask !== null && !state.isLoopRunning;
  if (shouldLoopRun) {
    getState().setLoopRunning(true);
    getState().setLastTickTimestamp(performance.now());
    requestAnimationFrame(gameLoop);
  }
}); 