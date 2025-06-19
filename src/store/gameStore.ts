import { create } from "zustand";
import {
  type ExplorationSlice,
  createExplorationSlice,
  calculateXpForLevel,
} from "./slices/explorationSlice";
import {
  type ResourceSlice,
  createResourceSlice,
} from "./slices/resourceSlice";
import {
  type EnvironmentSlice,
  createEnvironmentSlice,
} from "./slices/environmentSlice";

// --- CONSTANTES GLOBALES DE JUEGO ---
const XP_GAIN_PER_SECOND = 100;
const WOOD_CYCLE_SECONDS = 10; // Talar es más rápido
const FOOD_CYCLE_SECONDS = 10; // Recolectar comida es más lento

// --- TIPO GLOBAL DEL STORE ---
// 1. AÑADIMOS ESTADO PARA MANEJAR EL NUEVO BUCLE DE JUEGO
export type GameState = ExplorationSlice &
  ResourceSlice &
  EnvironmentSlice & {
    lastTickTimestamp: number;
    isLoopRunning: boolean;
    setLoopRunning: (isRunning: boolean) => void;
    setLastTickTimestamp: (ts: number) => void;
  };

// --- CREACIÓN DEL STORE ENSAMBLANDO SLICES ---
export const useGameStore = create<GameState>()((...a) => ({
  ...createExplorationSlice(...a),
  ...createResourceSlice(...a),
  ...createEnvironmentSlice(...a),

  // 2. VALORES INICIALES PARA EL ESTADO DEL BUCLE
  lastTickTimestamp: 0,
  isLoopRunning: false,
  setLoopRunning: (isRunning) => a[0]({ isLoopRunning: isRunning }),
  setLastTickTimestamp: (ts) => a[0]({ lastTickTimestamp: ts }),
}));

// ====================================================================
// 3. NUEVO MOTOR DEL JUEGO BASADO EN requestAnimationFrame
// ====================================================================

const gameLoop = (timestamp: number) => {
  const { getState } = useGameStore;
  const state = getState();

  // Si el bucle se detuvo desde el exterior, no continuamos
  if (!state.isLoopRunning) {
    return;
  }

  // Calculamos el deltaTime para que la velocidad del juego sea consistente
  const deltaTime = timestamp - state.lastTickTimestamp;
  getState().setLastTickTimestamp(timestamp);

  // --- Lógica de Exploración ---
  if (state.isExploring) {
    const xpGained = (deltaTime / 1000) * XP_GAIN_PER_SECOND;
    state.addXp(xpGained);
  }

// --- Lógica de Ciclos de Entorno (MODIFICADO) ---
  // Ahora solo procesamos el árbol que está activo.
  const activeTree = state.activeTreeId
    ? state.getTreeById(state.activeTreeId)
    : null;

  if (activeTree && activeTree.assignedTask && activeTree.durability > 0) {
    const cycleDuration =
      activeTree.assignedTask === 'wood' ? WOOD_CYCLE_SECONDS : FOOD_CYCLE_SECONDS;
    const progressPerSecond = 100 / cycleDuration;
    const progressGained = (deltaTime / 1000) * progressPerSecond;
    const newProgress = activeTree.progress + progressGained;

    if (newProgress >= 100) {
      state.processTreeCycle(activeTree.id);
    } else {
      state.updateTreeProgress(activeTree.id, newProgress);
    }
  }

  // --- Lógica de Subida de Nivel ---
  const totalXpForLevel = calculateXpForLevel(state.explorationLevel);
  if (state.currentXp >= totalXpForLevel) {
    const excessXp = state.currentXp - totalXpForLevel;
    const newLevel = state.explorationLevel + 1;

    getState().levelUp();
    getState().resetXp();
    getState().addXp(excessXp);
    console.log(`¡NIVEL DE EXPLORACIÓN COMPLETADO! Nuevo nivel: ${newLevel}`);

    if (newLevel % 4 === 0) {
      console.log("¡Has descubierto un nuevo árbol en tus exploraciones!");
      getState().discoverNewTree();
    }
  }

  // Solicitamos al navegador que vuelva a ejecutar gameLoop en el siguiente fotograma
  requestAnimationFrame(gameLoop);
};

// ====================================================================
// 4. EL SUBSCRIBE AHORA ES MÁS SIMPLE
// Su única responsabilidad es arrancar/parar el bucle y reaccionar a eventos
// puntuales como la subida de nivel.
// ====================================================================
useGameStore.subscribe((state) => {
  const { getState } = useGameStore;
  
  // El bucle debe correr si estamos explorando O si hay un árbol activo.
  const shouldLoopRun = state.isExploring || state.activeTreeId !== null;

  if (shouldLoopRun && !state.isLoopRunning) {
    getState().setLoopRunning(true);
    getState().setLastTickTimestamp(performance.now());
    requestAnimationFrame(gameLoop);
  } else if (!shouldLoopRun && state.isLoopRunning) {
    getState().setLoopRunning(false);
  }
});
