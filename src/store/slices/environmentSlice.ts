import type { StateCreator } from "zustand";
import type { GameState } from "../gameStore";

// --- INTERFACES Y TIPOS PARA ESTE SLICE ---
export type TaskType = "wood" | "food";

export interface Tree {
  id: number;
  durability: number;
  maxDurability: number;
  assignedTask: TaskType | null;
  progress: number;
}

export interface EnvironmentSlice {
  trees: Tree[];
  activeTreeId: number | null; // <-- NUEVO ESTADO
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
  activeTreeId: null,

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

    // 1. Detenemos la exploración y ponemos el foco en este árbol
    get().setExploring(false);
    set({ activeTreeId: treeId });

    // 2. Actualizamos la tarea del árbol seleccionado Y reseteamos su progreso.
    //    YA NO TOCAMOS los otros árboles, para que mantengan su estado pausado.
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

    if (tree.assignedTask === "wood") {
      get().addWood(1);
    } else if (tree.assignedTask === "food") {
      get().addFood(1);
    }
    const isWoodTask = tree.assignedTask === 'wood';
    const willBeDestroyed = isWoodTask && tree.durability === 1;
    

    if (willBeDestroyed) {
      console.log(`El árbol #${treeId} ha sido talado por completo y ha desaparecido.`);
      
      // Si el árbol va a ser destruido:
      set((state) => ({
        // 1. Lo eliminamos de la lista filtrando por su ID.
        trees: state.trees.filter((t) => t.id !== treeId),
        
        // 2. Si era el árbol activo, dejamos de tener un árbol activo.
        activeTreeId: state.activeTreeId === treeId ? null : state.activeTreeId,
      }));
    } else {
      // Si el árbol sobrevive, actualizamos su estado como de costumbre.
      set((state) => ({
        trees: state.trees.map((t) => {
          if (t.id === treeId) {
            const newDurability = isWoodTask ? t.durability - 1 : t.durability;
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
