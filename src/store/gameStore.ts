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
const XP_GAIN_PER_SECOND = 10;
const WOOD_CYCLE_SECONDS = 5; // Talar es más rápido
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

  // --- Lógica de Ciclos de Entorno ---
  state.trees.forEach((tree) => {
    if (tree.assignedTask && tree.durability > 0) {
      const cycleDuration =
        tree.assignedTask === "wood" ? WOOD_CYCLE_SECONDS : FOOD_CYCLE_SECONDS;
      const progressPerSecond = 100 / cycleDuration;
      const progressGained = (deltaTime / 1000) * progressPerSecond;
      const newProgress = tree.progress + progressGained;

      if (newProgress >= 100) {
        state.processTreeCycle(tree.id);
      } else {
        state.updateTreeProgress(tree.id, newProgress);
      }
    }
  });
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
  const shouldLoopRun =
    state.isExploring || state.trees.some((t) => t.assignedTask);

  if (shouldLoopRun && !state.isLoopRunning) {
    getState().setLoopRunning(true);
    getState().setLastTickTimestamp(performance.now());
    requestAnimationFrame(gameLoop);
  } else if (!shouldLoopRun && state.isLoopRunning) {
    getState().setLoopRunning(false);
  }
});
