// src/features/exploration/useExploration.ts
import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../store/gameStore'; // 1. Importamos nuestro nuevo store

// --- Constantes y función auxiliar (sin cambios) ---
const BASE_XP_REQUIRED = 5;
const XP_MULTIPLIER = 1.1;
const XP_GAIN_PER_SECOND = 1;

const calculateXpForLevel = (level: number): number => {
  return BASE_XP_REQUIRED * Math.pow(XP_MULTIPLIER, level - 1);
};


export const useExploration = () => {
  // 2. Extraemos el estado y las acciones del store global
  const {
    explorationLevel,
    currentXp,
    isExploring,
    setExploring,
    addXp,
    levelUp,
    resetXp
  } = useGameStore();

  const totalXpForLevel = calculateXpForLevel(explorationLevel);

  // Las refs para el temporizador siguen siendo locales al hook, porque no son parte del estado global
  const intervalRef = useRef<number | null>(null);
  const lastTickTimestampRef = useRef<number>(0);

  const clearExistingInterval = () => { /* ... (sin cambios) ... */ };

  // 3. Modificamos el toggle para que use las acciones del store
  const toggleExploration = useCallback(() => {
    if (!isExploring) {
      setExploring(true); // <--- Llama a la acción del store
      lastTickTimestampRef.current = Date.now();

      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const deltaTime = now - lastTickTimestampRef.current;
        lastTickTimestampRef.current = now;

        const xpGained = (deltaTime / 1000) * XP_GAIN_PER_SECOND;
        addXp(xpGained); // <--- Llama a la acción del store para añadir XP
      }, 100);

    } else {
      setExploring(false); // <--- Llama a la acción del store
      clearExistingInterval();
    }
  }, [isExploring, setExploring, addXp]);


  // 4. Usamos un useEffect para reaccionar a los cambios de XP y gestionar las subidas de nivel
  useEffect(() => {
    // Si la XP actual supera la necesaria para el nivel...
    if (currentXp >= totalXpForLevel) {
      const excessXp = currentXp - totalXpForLevel;
      levelUp(); // <--- Llama a la acción del store para subir de nivel
      resetXp(); // <--- Reseteamos la XP a 0
      addXp(excessXp); // <--- Y añadimos la XP sobrante
      console.log(`¡NIVEL DE EXPLORACIÓN COMPLETADO! Nuevo nivel: ${explorationLevel + 1}`);
    }
  }, [currentXp, totalXpForLevel, levelUp, resetXp, addXp, explorationLevel]); // Dependencias del efecto


  // Limpieza del intervalo al desmontar (sigue siendo crucial)
  useEffect(() => {
    // Si el componente se desmonta pero seguía explorando, detenemos el intervalo
    return () => {
      if (isExploring) {
        clearExistingInterval();
      }
    };
  }, [isExploring]); // Ahora depende de isExploring

  // 5. Devolvemos los datos del store y la función de control
  return {
    explorationLevel,
    currentXp,
    totalXpForLevel,
    isExploring,
    toggleExploration,
  };
};