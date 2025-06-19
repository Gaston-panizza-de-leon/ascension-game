import type { Tree, TaskType } from "../../../../store/slices/environmentSlice";
import styles from "./TreeCard.module.css";
import treeImage from "../../../../assets/tree.png"; // La ruta es relativa

// Imagen de placeholder para el árbol

interface TreeCardProps {
  tree: Tree;
  isActive: boolean; // <-- NUEVA PROP
  onAssignTask: (treeId: number, task: TaskType) => void;
}

export const TreeCard = ({ tree, isActive, onAssignTask }: TreeCardProps) => {
  const handleAssignTask = (task: TaskType) => {
    onAssignTask(tree.id, task);
  };

  // ====================================================================
  // NUEVA FUNCIÓN: Manejador para reanudar la tarea actual de la tarjeta
  // ====================================================================
  const handleResumeTask = () => {
    // Si la tarjeta está activa, no hacemos nada al hacer clic en ella.
    if (isActive || !tree.assignedTask) return;

    // Si está pausada, reasignamos su propia tarea para reanudarla.
    onAssignTask(tree.id, tree.assignedTask);
  };

  const isFoodDisabled = tree.durability < tree.maxDurability;

  // --- RENDERIZADO DEL ESTADO ACTIVO ---
  // --- RENDERIZADO INICIAL (CUANDO NO HAY TAREA ASIGNADA) ---
  if (!tree.assignedTask) {
    return (
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <img src={treeImage} alt="Árbol" className={styles.image} />
        </div>
        <div className={styles.info}>
          <h3>Árbol #{tree.id}</h3>
          <p>A la espera de una tarea...</p>
          <div className={styles.actions}>
            <button onClick={() => handleAssignTask("food")}>
              Recolectar 🍎
            </button>
            <button onClick={() => handleAssignTask("wood")}>Talar 🪓</button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO PERSISTENTE (CUANDO YA TIENE UNA TAREA ASIGNADA) ---
  const progress = isActive ? tree.progress : 0; // El progreso solo se muestra si está activa
  const progressStyle = {
    background: `conic-gradient(#4CAF50 ${progress * 3.6}deg, #555 ${
      progress * 3.6
    }deg)`,
  };
  const resourceIcon = tree.assignedTask === "wood" ? "🪓" : "🍎";
  const taskText = tree.assignedTask === "wood" ? "Talar" : "Recolectar";

  return (
    // La tarjeta se ve "activa" si es la que está en curso
    <div
      className={`${styles.card} ${isActive ? styles.active : styles.paused}`}
      onClick={handleResumeTask}
      title={!isActive ? `Haz clic para reanudar: ${taskText}` : ""}
    >
      <div className={styles.circularProgress} style={progressStyle}>
        <img src={treeImage} alt="Árbol" className={styles.image} />
      </div>
      <div className={styles.info}>
        <h3>Árbol #{tree.id}</h3>
        <p className={styles.task}>
          {isActive ? "En curso:" : "Pausado:"} {taskText} {resourceIcon}
        </p>
        {tree.assignedTask === "wood" ? (
          <div className={styles.durability}>
            <span>Durabilidad</span>
            <progress
              max={tree.maxDurability}
              value={tree.durability}
            ></progress>
            <span>{`${tree.durability}/${tree.maxDurability}`}</span>
          </div>
        ) : (
          // Este div ocupa el mismo espacio pero será invisible
          <div className={`${styles.durability} ${styles.placeholder}`}>
            &nbsp; 
          </div>
        )}
      </div>

      {/* Los botones para cambiar de tarea solo se pueden clicar,
          no reanudan la tarea. Detenemos la propagación del evento
          para no activar el onClick del div principal. */}
      <div
        className={styles.switchActions}
        onClick={(e) => e.stopPropagation()}
      >
        {tree.assignedTask === "food" && (
          <button onClick={() => handleAssignTask("wood")}>
            Cambiar a Talar 🪓
          </button>
        )}
        {tree.assignedTask === "wood" && (
          <button
            onClick={() => handleAssignTask("food")}
            disabled={isFoodDisabled}
            title={
              isFoodDisabled
                ? "No se puede recolectar comida de un árbol dañado"
                : "Cambiar a Recolectar 🍎"
            }
          >
            Cambiar a Recolectar 🍎
          </button>
        )}
      </div>
    </div>
  );
};
