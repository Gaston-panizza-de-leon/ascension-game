import type { Tree } from "../../../../store/slices/environmentSlice";
import type {
  TaskType,
  Villager,
  VillagerTask,
} from "../../../../store/slices/villagersSlice";
import styles from "./TreeCard.module.css";
import treeImage from "@assets/enviroment/tree.png";
import villagerMImage from "@assets/villagers/villagerMReduced.png";
import villagerFImage from "@assets/villagers/villagerFReduced.png";

interface TreeCardProps {
  tree: Tree;
  assignedVillager: Villager | undefined;
  isPlayerWorkingHere: boolean;
  onSetTreeTaskType: (treeId: number, task: TaskType | null) => void;
  onPlayerAssignTask: (task: VillagerTask | null) => void;
  onUnassignVillager: (task: VillagerTask) => void;
}

export const TreeCard = ({
  tree,
  assignedVillager,
  isPlayerWorkingHere,
  onSetTreeTaskType,
  onPlayerAssignTask,
  onUnassignVillager,
}: TreeCardProps) => {
  // Lógica para que el jugador se asigne (SIN PAUSA)
  const handlePlayerAssign = (taskType: TaskType) => {
    // Si el jugador ya está en otra tarea de árbol, esto lo cambiará directamente
    onSetTreeTaskType(tree.id, taskType);
    onPlayerAssignTask({ type: taskType, targetId: tree.id });
  };

  // Lógica para el botón 'X' de desasignar aldeano
  const handleUnassignVillager = () => {
    if (assignedVillager && assignedVillager.assignedTask) {
      onUnassignVillager(assignedVillager.assignedTask);
    }
  };

  const isOccupiedByVillager = !!assignedVillager;
  const isActive = isPlayerWorkingHere || isOccupiedByVillager;
  const progress = isActive ? tree.progress : 0;

  const progressStyle = {
    background: `conic-gradient(#4CAF50 ${progress * 3.6}deg, #3a3a3a ${
      progress * 3.6
    }deg)`,
  };

  const isDamaged = tree.durability < tree.maxDurability;

  const handleCardClick = () => {
    // Solo funciona si el árbol tiene una tarea definida y está TOTALMENTE libre
    if (isActive || !tree.taskType) {
      return;
    }
    onPlayerAssignTask({ type: tree.taskType, targetId: tree.id });
  };

  // El texto de estado cambia según quién trabaje y qué tarea
  let statusText = "En espera...";
  if (isPlayerWorkingHere) {
    statusText =
      tree.taskType === "wood" ? "Talando (Tú)" : "Recolectando (Tú)";
  } else if (isOccupiedByVillager) {
    statusText = tree.taskType === "wood" ? "Talando..." : "Recolectando...";
  }

  const isClickable = !isActive && !!tree.taskType;
  const cardClasses = `${styles.card} ${isActive ? styles.active : ""} ${
    isClickable ? styles.clickable : ""
  }`;

  return (
    <div className={cardClasses} onClick={handleCardClick} title={isClickable ? `Asignarte a: ${tree.taskType}` : ''}>
      {isOccupiedByVillager && (
        <button
          onClick={handleUnassignVillager}
          className={styles.unassignButton}
          title="Liberar aldeano"
        >
          X
        </button>
      )}

      {/* Icono del aldeano trabajando */}
      {isOccupiedByVillager && (
        <img
          src={
            assignedVillager.sex === "male" ? villagerMImage : villagerFImage
          }
          alt="Aldeano trabajando"
          className={styles.workerIcon}
        />
      )}

      <div className={styles.circularProgress} style={progressStyle}>
        <img src={treeImage} alt="Árbol" className={styles.image} />
      </div>

      <div className={styles.info}>
        <h3>Árbol #{tree.id}</h3>
        <p className={styles.status}>{statusText}</p>

        {/* Placeholder para mantener la altura constante */}
        <div className={styles.durability}>
          {tree.taskType === "wood" ? (
            <>
              <span>Durabilidad</span>
              <progress
                max={tree.maxDurability}
                value={tree.durability}
              ></progress>
              <span>{`${tree.durability}/${tree.maxDurability}`}</span>
            </>
          ) : (
            <span>&nbsp;</span> /* Ocupa espacio para alinear */
          )}
        </div>
      </div>

      {/* Acciones del jugador: solo se muestra el botón de la tarea CONTRARIA */}
      <div className={styles.actions}>
        {tree.taskType !== "food" && (
          <button
            onClick={() => handlePlayerAssign("food")}
            disabled={isOccupiedByVillager || isDamaged}
          >
            Recolectar 🍎
          </button>
        )}
        {tree.taskType !== "wood" && (
          <button
            onClick={() => handlePlayerAssign("wood")}
            disabled={isOccupiedByVillager}
          >
            Talar 🪓
          </button>
        )}
      </div>
    </div>
  );
};
