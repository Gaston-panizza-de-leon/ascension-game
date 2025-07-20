import type { StateCreator } from "zustand";
import type { GameState } from "../gameStore";
import buildingBlueprints from "../../data/buildings.json"; // Importamos nuestros planos

// --- Definimos la forma del estado de este slice ---

// Representa un proyecto de construcción activo
export interface ActiveConstruction {
  buildingId: string;
  progress: number; // de 0 a 100
}

// El "contrato" de nuestro slice
export interface BuildingsSlice {
  // Un registro de cuántos edificios de cada tipo tenemos. Ej: { "HOUSE": 2 }
  builtBuildings: Record<string, number>;
  activeConstruction: ActiveConstruction | null;

  // --- Las acciones que podemos realizar ---

  // Inicia la construcción de un nuevo edificio
  startConstruction: (buildingId: string) => boolean; // Devuelve true si tuvo éxito
  // Avanza el progreso de la construcción activa
  advanceConstruction: (progressAmount: number) => void;
}

// --- La implementación del slice ---

export const createBuildingsSlice: StateCreator<
  GameState,
  [],
  [],
  BuildingsSlice
> = (set, get) => ({
  builtBuildings: {},
  activeConstruction: null,

  startConstruction: (buildingId: string) => {
    // 1. Comprobar si ya hay una construcción activa
    if (get().activeConstruction) {
      return false;
    }

    // 2. Encontrar la plantilla del edificio en nuestro JSON
    const blueprint = buildingBlueprints.find((b) => b.id === buildingId);
    if (!blueprint) {
      return false;
    }

    // 3. Comprobar y deducir el coste de los recursos
    const { wood, removeWood } = get();
    const cost = blueprint.cost;

    if (wood < cost.wood) {
      // Asumimos coste de madera por ahora
      return false;
    }

    // Si tenemos recursos, los gastamos
    removeWood(cost.wood);

    // 4. Establecer la nueva construcción activa
    set({
      activeConstruction: {
        buildingId: buildingId,
        progress: 0,
      },
    });

    console.log(`¡Construcción de ${blueprint.name} iniciada!`);
    return true;
  },

  advanceConstruction: (progressAmount: number) => {
    const currentConstruction = get().activeConstruction;
    if (!currentConstruction) return;

    const newProgress = currentConstruction.progress + progressAmount;

    if (newProgress >= 100) {
      // --- ¡Construcción completada! ---
      const buildingId = currentConstruction.buildingId;

      set((state) => ({
        // Añadimos el edificio al contador de construidos
        builtBuildings: {
          ...state.builtBuildings,
          [buildingId]: (state.builtBuildings[buildingId] || 0) + 1,
        },

        // Limpiamos la construcción activa
        activeConstruction: null,
      }));
      if (buildingId === "HOUSE") {
        get().addConstructedHouse({ buildingId: "HOUSE" });
      }

      // Aquí, en el futuro, aplicaríamos los efectos del edificio (ej: aumentar cap. de población)
    } else {
      // Simplemente actualizamos el progreso
      set({
        activeConstruction: {
          ...currentConstruction,
          progress: newProgress,
        },
      });
    }
  },
});
