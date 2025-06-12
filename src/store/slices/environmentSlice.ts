import type { StateCreator } from 'zustand';
import type { GameState } from '../gameStore'; // Importamos el tipo global para el `get`

// --- INTERFACES Y TIPOS PARA ESTE SLICE ---
export type TaskType = 'wood' | 'food';

export interface Tree {
  id: number;
  durability: number;
  maxDurability: number;
  assignedTask: TaskType | null;
  progress: number; // Progreso del ciclo actual (0-100)
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
  GameState, // Usa el tipo global
  [],
  [],
  EnvironmentSlice
> = (set, get) => ({
  trees: [
    // Para maquetar, empezamos con un árbol ya descubierto.
    {
      id: 1,
      durability: 8,
      maxDurability: 8,
      assignedTask: null,
      progress: 0,
    },
  ],

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
    set((state) => ({
      trees: state.trees.map((tree) =>
        tree.id === treeId ? { ...tree, assignedTask: task, progress: 0 } : tree
      ),
    }));
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

    // Añadir el recurso correspondiente
    if (tree.assignedTask === 'wood') {
      get().addWood(1); // Usamos la acción del resourceSlice
      console.log('Madera recolectada!');
    } else if (tree.assignedTask === 'food') {
      get().addFood(2); // Usamos la acción del resourceSlice
      console.log('Comida recolectada!');
    }

    // Actualizar durabilidad y resetear progreso
    set((state) => ({
      trees: state.trees.map((t) =>
        t.id === treeId
          ? { ...t, durability: t.durability - 1, progress: 0 }
          : t
      ),
    }));
  },

  getTreeById: (treeId) => {
    return get().trees.find(t => t.id === treeId);
  }
});