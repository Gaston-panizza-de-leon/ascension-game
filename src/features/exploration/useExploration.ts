// src/features/exploration/useExploration.ts
import { useGameStore } from '../../store/gameStore';

// --- Constantes y función auxiliar (sin cambios) ---
const BASE_XP_REQUIRED = 5;
const XP_MULTIPLIER = 1.1;

const calculateXpForLevel = (level: number): number => {
  return BASE_XP_REQUIRED * Math.pow(XP_MULTIPLIER, level - 1);
};

export const useExploration = () => {
  const {
    explorationLevel,
    currentXp,
    isExploring,
    setExploring,
  } = useGameStore();

  const totalXpForLevel = calculateXpForLevel(explorationLevel);

  // 2. La función de toggle ahora es súper simple.
  const toggleExploration = () => {
    setExploring(!isExploring);
  };

  // 3. Devolvemos los datos para que la UI los consuma.
  return {
    explorationLevel,
    currentXp,
    totalXpForLevel,
    isExploring,
    toggleExploration,
  };
};