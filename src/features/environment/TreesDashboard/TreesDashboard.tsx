import { useGameStore } from "../../../store/gameStore";
import { TreeCard } from "../components/TreeCard/TreeCard";
import styles from "./TreesDashboard.module.css"; // Puedes reutilizar o crear uno nuevo

const TreesDashboard = () => {
  const trees = useGameStore((state) => state.trees);
  const villagers = useGameStore((state) => state.villagers);
  const playerTask = useGameStore((state) => state.playerTask);
  const setTreeTaskType = useGameStore((state) => state.setTreeTaskType);
  const setPlayerTask = useGameStore((state) => state.setPlayerTask);
  const unassignedVillagersByTask = useGameStore((state) => state.unassignVillagersByTask);

  // La lógica de filtrado ahora se basa en 'taskType', que define la función del árbol
  const unassignedTrees = trees.filter((tree) => tree.taskType === null);
  const foodTrees = trees.filter((tree) => tree.taskType === "food");
  const woodTrees = trees.filter((tree) => tree.taskType === "wood");

  // Función para renderizar las tarjetas, pasando las props correctas
  const renderTreeCards = (treeList: typeof trees) => {
    return treeList.map((tree) => {
      // Para cada tarjeta, calculamos su estado de ocupación
      const assignedVillager = villagers.find(
        (v) => v.assignedTask?.targetId === tree.id
      );

      const isPlayerWorkingHere = playerTask?.targetId === tree.id;
      return (
        <TreeCard
          key={tree.id}
          tree={tree}
          assignedVillager={assignedVillager}
          isPlayerWorkingHere={isPlayerWorkingHere}
          onSetTreeTaskType={setTreeTaskType}
          onPlayerAssignTask={setPlayerTask}
          onUnassignVillager={unassignedVillagersByTask}
        />
      );
    });
  };

  return (
    <div>
      {unassignedTrees.length > 0 && (
        <div className={styles.unassignedSection}>
          <h4>Nuevos Descubrimientos</h4>
          <div className={styles.unassignedContainer}>
            {renderTreeCards(unassignedTrees)}
          </div>
        </div>
      )}
      <div className={styles.layoutContainer}>
        <div className={styles.column}>
          <h3>Recolección Sostenible (Comida)</h3>
          <div className={styles.treesGrid}>{renderTreeCards(foodTrees)}</div>
        </div>
        <div className={styles.separator}></div>
        <div className={styles.column}>
          <h3>Tala (Madera)</h3>
          <div className={styles.treesGrid}>{renderTreeCards(woodTrees)}</div>
        </div>
      </div>
    </div>
  );
};

export default TreesDashboard;
