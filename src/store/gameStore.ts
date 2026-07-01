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
import { saveService, type GameSaveData } from '../utils/saveService';

// --- CONSTANTES ---
const XP_GAIN_PER_UNIT = 5; // La ganancia de XP
const WOOD_CYCLE_DAYS = 0.5;
const FOOD_CYCLE_DAYS = 1;
const POPULATION_PER_HOUSE = 4;

// --- TIPO GLOBAL ---
export type GameState = ExplorationSlice & ResourceSlice & EnvironmentSlice & VillageSlice & VillagersSlice & PlayerSlice & TimeSlice & BuildingsSlice & {
  lastTickTimestamp: number;
  isLoopRunning: boolean;
  isPaused: boolean;
  isIdlePanelSuppressed: boolean; 
  setIdlePanelSuppressed: (isSuppressed: boolean) => void;
  setLoopRunning: (isRunning: boolean) => void;
  setLastTickTimestamp: (ts: number) => void;
  processConstruction: (deltaTime: number) => void;
  processExploration: (deltaTime: number) => void;
  processTreeResources: (deltaTime: number) => void;
  getPopulationCapacity: () => number;
  togglePause: () => void;
  hydrateFromSave: (data: GameSaveData) => void;
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
  isPaused: false,
  isIdlePanelSuppressed: false,
  setLastTickTimestamp: (ts) => a[0]({ lastTickTimestamp: ts }),
  setLoopRunning: (isRunning) => a[0]({ isLoopRunning: isRunning }),
  setIdlePanelSuppressed: (isSuppressed) => a[0]({ isIdlePanelSuppressed: isSuppressed }),
  

  processConstruction: (deltaTime: number) => {
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
  },


  // --- LÓGICA DE EXPLORACIÓN UNIFICADA ---
  processExploration: (deltaTime) => {
    const { playerTask, villagers, addXp } = useGameStore.getState();

    // 1. Obtenemos la lista de aldeanos que están explorando.
    const isPlayerExploring = playerTask?.type === 'exploration';
    const explorationVillagers = villagers.filter(v => v.assignedTask?.type === 'exploration');

    // 2. Sumamos su productividad real para obtener el "Poder de Exploración".
    const totalVillagerExplorationPower = explorationVillagers.reduce((sum, villager) => {
      return sum + villager.productivityModifier;
    }, 0);

    // 3. El esfuerzo total ahora incluye la eficiencia de los aldeanos.
    const totalExplorationEffort = (isPlayerExploring ? 1 : 0) + totalVillagerExplorationPower;

    if (totalExplorationEffort > 0) {
      const xpGained = (deltaTime / 1000) * XP_GAIN_PER_UNIT * totalExplorationEffort;
      addXp(xpGained); // Llamamos a la acción del store
    }
  },

  // --- LÓGICA DE RECURSOS UNIFICADA ---
  processTreeResources: (deltaTime) => {
    const {
      trees,
      playerTask,
      villagers,
      processTreeCycle,
      updateTreeProgress
    } = useGameStore.getState();

    trees.forEach((tree) => {
      const isPlayerWorkingHere = playerTask?.targetId === tree.id;
      const villagerWorker = villagers.find(v => v.assignedTask?.targetId === tree.id);

      if (isPlayerWorkingHere || villagerWorker) {
        const workerTask = isPlayerWorkingHere ? playerTask! : villagerWorker!.assignedTask!;

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
            processTreeCycle(tree.id);
          } else {
            updateTreeProgress(tree.id, newProgress);
          }
        }
      } else if (tree.progress > 0) {
        updateTreeProgress(tree.id, 0);
      }
    });
  },

  // --- SELECTOR DE CAPACIDAD POBLACIONAL ---
  getPopulationCapacity: (): number => {
    const state = useGameStore.getState();
    const houseCount = state.houses.length || 0;
    return houseCount * POPULATION_PER_HOUSE;
  },

  // --- TOGGLE PAUSA ---
  togglePause: () => {
    const state = useGameStore.getState();
    // Si el juego no está corriendo, no hacemos nada
    if (!state.isLoopRunning) return;

    // Invertimos el valor de isPaused
    useGameStore.setState({ isPaused: !state.isPaused });
  },

  hydrateFromSave: (data) => {
    useGameStore.setState({
      currentDay: data.currentDay,
      timeOfDayProgress: data.timeOfDayProgress,
      wood: data.wood,
      food: data.food,
      stone: data.stone,
      explorationLevel: data.explorationLevel,
      currentXp: data.currentXp,
      playerTask: data.playerTask,
      trees: data.trees,
      villagers: data.villagers,
      foodPolicy: data.foodPolicy,
      houses: data.houses,
      nextHouseId: data.nextHouseId,
      builtBuildings: data.builtBuildings,
      activeConstruction: data.activeConstruction,
      lastTickTimestamp: performance.now(),
      isPaused: data.isPaused ?? false,
      isLoopRunning: false,
    });
  },
}));

// --- PERSISTENCIA ---
function persistSnapshot() {
  const state = useGameStore.getState();
  const saveData: GameSaveData = {
    version: 1,
    currentDay: state.currentDay,
    timeOfDayProgress: state.timeOfDayProgress,
    wood: state.wood,
    food: state.food,
    stone: state.stone,
    explorationLevel: state.explorationLevel,
    currentXp: state.currentXp,
    playerTask: state.playerTask,
    trees: state.trees,
    villagers: state.villagers,
    foodPolicy: state.foodPolicy,
    houses: state.houses,
    nextHouseId: state.nextHouseId,
    builtBuildings: state.builtBuildings,
    activeConstruction: state.activeConstruction,
    lastTickTimestamp: state.lastTickTimestamp,
    isPaused: state.isPaused,
  };
  saveService.saveGame(saveData).catch(console.error);
}

// --- MOTOR DEL JUEGO UNIFICADO ---
const gameLoop = (timestamp: number) => {

  const state = useGameStore.getState();
  if (state.isPaused) {
    state.setLastTickTimestamp(timestamp);
    requestAnimationFrame(gameLoop); 
    return;
  }
  if (!state.isLoopRunning) return;

  const deltaTime = timestamp - state.lastTickTimestamp;
  state.setLastTickTimestamp(timestamp);
  state.processExploration(deltaTime);

  state.processTreeResources(deltaTime);

  // --- LÓGICA DE SUBIDA DE NIVEL ---
  const totalXpForLevel = calculateXpForLevel(state.explorationLevel);
  if (state.currentXp >= totalXpForLevel) {
    const excessXp = state.currentXp - totalXpForLevel;
    const newLevel = state.explorationLevel + 1;
    state.levelUp();
    state.resetXp();
    state.addXp(excessXp);
    if (newLevel % 4 === 0) state.discoverNewTree();
    if (newLevel % 10 === 0) state.discoverNewVillager();
  }
  const daysPassed = state.advanceTime(deltaTime);
  if (daysPassed > 0) {
    state.processFoodAndHunger();
    state.processAging();
    state.processReproduction();
    state.updateHousingAndRelocation();
    state.updateVillagerProductivity();
    persistSnapshot();
  }
  state.processConstruction(deltaTime);
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