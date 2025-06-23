import type { StateCreator } from 'zustand';
import type { GameState } from '../gameStore';
import type { TaskType } from './villagersSlice';

// --- INTERFACES Y TIPOS ---
export interface Tree {
  id: number;
  durability: number;
  maxDurability: number;
  // Este es el TIPO de tarea que el jugador ha definido para el árbol
  taskType: TaskType | null; 
  progress: number;
}

export interface EnvironmentSlice {
  trees: Tree[];
  discoverNewTree: () => void;
  // Acción para que el jugador defina para qué sirve un árbol
  setTreeTaskType: (treeId: number, task: TaskType | null) => void;
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
    set((state) => ({
      trees: [
        ...state.trees,
        {
          id: state.trees.length > 0 ? Math.max(...state.trees.map(t => t.id)) + 1 : 1,
          durability: 8,
          maxDurability: 8,
          taskType: null,
          progress: 0,
        },
      ],
    }));
  },
  
  setTreeTaskType: (treeId, task) => {
    set(state => ({
        trees: state.trees.map(tree => 
            tree.id === treeId ? { ...tree, taskType: task } : tree
        )
    }))
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
    if (!tree) return;
    
    const workerTask = get().playerTask?.targetId === treeId 
        ? get().playerTask
        : get().villagers.find(v => v.assignedTask?.targetId === treeId)?.assignedTask;

    if (!workerTask) return;

    if (workerTask.type === 'wood') get().addWood(1);
    else if (workerTask.type === 'food') get().addFood(1);

    const willBeDestroyed = workerTask.type === 'wood' && tree.durability === 1;

    if (willBeDestroyed) {
      get().unassignVillagersByTask({ type: workerTask.type, targetId: treeId });
      if (get().playerTask?.targetId === treeId) get().setPlayerTask(null);
      set((state) => ({
        trees: state.trees.filter((t) => t.id !== treeId),
      }));
    } else {
      set((state) => ({
        trees: state.trees.map((t) => {
          if (t.id === treeId) {
            const newDurability = workerTask.type === 'wood' ? t.durability - 1 : t.durability;
            return { ...t, durability: newDurability, progress: 0 };
          }
          return t;
        }),
      }));
    }
  },

  getTreeById: (treeId) => {
    return get().trees.find((t) => t.id === treeId);
  },
});