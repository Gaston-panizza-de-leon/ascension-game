import { useGameStore } from "../../../store/gameStore";
import { TreeCard } from "../components/TreeCard/TreeCard";
import styles from "./TreesDashboard.module.css";

const TreesDashboard = () => {
  // Sacamos los árboles y la acción para asignar tareas del store
  const trees = useGameStore((state) => state.trees);
  const assignTaskToTree = useGameStore((state) => state.assignTaskToTree);
  const activeTreeId = useGameStore((state) => state.activeTreeId);

  // 1. Árboles nuevos, sin tarea asignada.
  const unassignedTrees = trees.filter((tree) => tree.assignedTask === null);

  // 2. Árboles asignados a la recolección de comida.
  const foodTrees = trees.filter((tree) => tree.assignedTask === "food");

  // 3. Árboles asignados a la tala de madera.
  const woodTrees = trees.filter((tree) => tree.assignedTask === "wood");

  return (
    <div>
      <h2>Entorno</h2>
      <p>Recursos descubiertos. Asigna tareas para recolectar materiales.</p>

      {/* ==================================================================== */}
      {/* NUEVA SECCIÓN: Contenedor para árboles sin asignar                 */}
      {/* ==================================================================== */}
      {unassignedTrees.length > 0 && (
        <div className={styles.unassignedSection}>
          <h4>Nuevos Descubrimientos</h4>
          <div className={styles.unassignedContainer}>
            {unassignedTrees.map((tree) => (
              <TreeCard
                key={tree.id}
                tree={tree}
                onAssignTask={assignTaskToTree}
                isActive={tree.id === activeTreeId}
              />
            ))}
          </div>
        </div>
      )}
      {/* Contenedor principal para el layout de dos columnas */}
      <div className={styles.layoutContainer}>
        {/* Columna Izquierda: Comida y Nuevos Árboles */}
        <div className={styles.column}>
          <h3>Recolección Sostenible (Comida)</h3>
          <div className={styles.treesGrid}>
            {foodTrees.length === 0 ? (
              <p className={styles.emptyMessage}>
                No hay árboles para recolectar comida.
              </p>
            ) : (
              foodTrees.map((tree) => (
                <TreeCard
                  key={tree.id}
                  tree={tree}
                  onAssignTask={assignTaskToTree}
                  isActive={tree.id === activeTreeId}
                />
              ))
            )}
          </div>
        </div>

        {/* Separador Visual */}
        <div className={styles.separator}></div>

        {/* Columna Derecha: Madera */}
        <div className={styles.column}>
          <h3>Tala (Madera)</h3>
          <div className={styles.treesGrid}>
            {woodTrees.length === 0 ? (
              <p className={styles.emptyMessage}>
                No hay árboles asignados a la tala.
              </p>
            ) : (
              woodTrees.map((tree) => (
                <TreeCard
                  key={tree.id}
                  tree={tree}
                  onAssignTask={assignTaskToTree}
                  isActive={tree.id === activeTreeId}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreesDashboard;
