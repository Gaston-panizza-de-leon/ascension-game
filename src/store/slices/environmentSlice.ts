import type { StateCreator } from 'zustand';
import type { GameState } from '../gameStore';

// --- INTERFACES Y TIPOS PARA ESTE SLICE ---
export type TaskType = 'wood' | 'food';

export interface Tree {
  id: number;
  durability: number;
  maxDurability: number;
  assignedTask: TaskType | null;
  progress: number;
}

export interface EnvironmentSlice {
  trees: Tree[];
  discoverNewTree: () => void;
  assignTaskToTree: (treeId: number, task: TaskType) => void;
  updateTreeProgress: (treeId: number, progress: number) => void;
  processTreeCycle: (treeId: number) => void;
  getTreeById: (treeId: number) => Tree | undefined;
}

// --- CREACIÓN DEL SLICE ---
export const createEnvironmentSlice: StateCreator<
  GameState,
  [],
  [],
  EnvironmentSlice
> = (set, get) => ({
  trees: [],

  discoverNewTree: () => {
    set((state) => {
      const newTree: Tree = {
        id: state.trees.length + 1,
        durability: 8,
        maxDurability: 8,
        assignedTask: null,
        progress: 0,
      };
      return { trees: [...state.trees, newTree] };
    });
  },

  assignTaskToTree: (treeId, task) => {
    // ====================================================================
    // CAMBIO CLAVE: Lógica de exclusividad de tarea
    // ====================================================================

    // 1. Detenemos la exploración
    get().setExploring(false);

    // 2. Reseteamos el progreso de TODOS los árboles, y asignamos la
    //    nueva tarea al árbol seleccionado.
    const newTrees = get().trees.map((tree) => {
      // Si es el árbol al que le asignamos la tarea...
      if (tree.id === treeId) {
        return { ...tree, assignedTask: task, progress: 0 };
      }
      // Para todos los demás árboles, cancelamos su tarea.
      return { ...tree, assignedTask: null, progress: 0 };
    });

    // 3. Actualizamos el estado de los árboles
    set({ trees: newTrees });
  },

  updateTreeProgress: (treeId, progress) => {
    set((state) => ({
      trees: state.trees.map((tree) =>
        tree.id === treeId ? { ...tree, progress } : tree
      ),
    }));
  },

  processTreeCycle: (treeId) => {
    const tree = get().getTreeById(treeId);
    if (!tree || !tree.assignedTask) return;

    if (tree.assignedTask === 'wood') {
      get().addWood(1);
      console.log('Madera recolectada!');
    } else if (tree.assignedTask === 'food') {
      get().addFood(1);
      console.log('Comida recolectada!');
    }

    // ====================================================================
    // CAMBIO CLAVE: La durabilidad solo baja si la tarea es 'wood'
    // El progreso se resetea en ambos casos.
    // ====================================================================
    set((state) => ({
      trees: state.trees.map((t) => {
        if (t.id === treeId) {
          const newDurability =
            t.assignedTask === 'wood' ? t.durability - 1 : t.durability;
          return { ...t, durability: newDurability, progress: 0 };
        }
        return t;
      }),
    }));
  },

  getTreeById: (treeId) => {
    return get().trees.find((t) => t.id === treeId);
  },
});