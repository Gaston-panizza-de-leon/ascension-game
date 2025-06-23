import { create } from "zustand";
import { type ExplorationSlice, createExplorationSlice, calculateXpForLevel } from "./slices/explorationSlice";
import { type ResourceSlice, createResourceSlice } from "./slices/resourceSlice";
import { type EnvironmentSlice, createEnvironmentSlice } from "./slices/environmentSlice";
import { type VillageSlice, createVillageSlice } from "./slices/villageSlice";
import { type VillagersSlice, createVillagersSlice } from "./slices/villagersSlice";
import { type PlayerSlice, createPlayerSlice } from "./slices/playerSlice";

// --- CONSTANTES ---
const XP_GAIN_PER_UNIT = 300; // La ganancia de XP es por "unidad" (jugador o aldeano)
const WOOD_CYCLE_SECONDS = 5;
const FOOD_CYCLE_SECONDS = 10;

// --- TIPO GLOBAL ---
export type GameState = ExplorationSlice & ResourceSlice & EnvironmentSlice & VillageSlice & VillagersSlice & PlayerSlice & {
    lastTickTimestamp: number;
    isLoopRunning: boolean;
    setLoopRunning: (isRunning: boolean) => void;
    setLastTickTimestamp: (ts: number) => void;
  };

// --- CREACIÓN DEL STORE ---
export const useGameStore = create<GameState>()((...a) => ({
  ...createExplorationSlice(...a),
  ...createResourceSlice(...a),
  ...createEnvironmentSlice(...a),
  ...createVillageSlice(...a),
  ...createVillagersSlice(...a),
  ...createPlayerSlice(...a),
  lastTickTimestamp: 0,
  isLoopRunning: false,
  setLoopRunning: (isRunning) => a[0]({ isLoopRunning: isRunning }),
  setLastTickTimestamp: (ts) => a[0]({ lastTickTimestamp: ts }),
}));

// --- MOTOR DEL JUEGO UNIFICADO ---
const gameLoop = (timestamp: number) => {
  const { getState } = useGameStore;
  const state = getState();
  if (!state.isLoopRunning) return;

  const deltaTime = timestamp - state.lastTickTimestamp;
  getState().setLastTickTimestamp(timestamp);

  // --- LÓGICA DE EXPLORACIÓN UNIFICADA ---
  const isPlayerExploring = state.playerTask?.type === 'exploration';
  const explorationVillagersCount = state.villagers.filter(v => v.assignedTask?.type === 'exploration').length;
  const totalExplorationEffort = (isPlayerExploring ? 1 : 0) + explorationVillagersCount;

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
      const cycleDuration = workerTask.type === 'wood' ? WOOD_CYCLE_SECONDS : FOOD_CYCLE_SECONDS;
      const progressPerSecond = 100 / cycleDuration;
      const progressGained = (deltaTime / 1000) * progressPerSecond;
      const newProgress = tree.progress + progressGained;

      if (newProgress >= 100) {
        state.processTreeCycle(tree.id);
      } else {
        state.updateTreeProgress(tree.id, newProgress);
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

  requestAnimationFrame(gameLoop);
};

// El bucle corre si el jugador o un aldeano están trabajando
useGameStore.subscribe((state) => {
  const { getState } = useGameStore;
  const shouldLoopRun = state.playerTask !== null || state.villagers.some(v => v.assignedTask !== null);
  if (shouldLoopRun && !state.isLoopRunning) {
    getState().setLoopRunning(true);
    getState().setLastTickTimestamp(performance.now());
    requestAnimationFrame(gameLoop);
  } else if (!shouldLoopRun && state.isLoopRunning) {
    getState().setLoopRunning(false);
  }
});