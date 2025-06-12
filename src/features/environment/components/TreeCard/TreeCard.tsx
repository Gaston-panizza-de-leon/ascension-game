import type { Tree, TaskType } from '../../../../store/slices/environmentSlice';
import styles from './TreeCard.module.css';
import treeImage from '../../../../assets/arbol.jpg'; // La ruta es relativa

// Imagen de placeholder para el árbol


interface TreeCardProps {
  tree: Tree;
  onAssignTask: (treeId: number, task: TaskType) => void;
}

export const TreeCard = ({ tree, onAssignTask }: TreeCardProps) => {
  const handleAssignTask = (task: TaskType) => {
    onAssignTask(tree.id, task);
  };

  // --- RENDERIZADO DEL ESTADO ACTIVO ---
  if (tree.assignedTask) {
    const progressStyle = {
      background: `conic-gradient(
        #4CAF50 ${tree.progress * 3.6}deg,
        #555 ${tree.progress * 3.6}deg
      )`,
    };

    const resourceIcon = tree.assignedTask === 'wood' ? '🪓' : '🍎';

    return (
      <div className={`${styles.card} ${styles.active}`}>
        <div className={styles.circularProgress} style={progressStyle}>
          <img src={treeImage} alt="Árbol" className={styles.image} />
        </div>
        <div className={styles.info}>
          <h3>Árbol #{tree.id}</h3>
          <p className={styles.task}>
            Tarea: Recolectar {resourceIcon}
          </p>
          <div className={styles.durability}>
            <span>Durabilidad</span>
            <progress
              max={tree.maxDurability}
              value={tree.durability}
            ></progress>
            <span>{`${tree.durability}/${tree.maxDurability}`}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO DEL ESTADO INACTIVO ---
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={treeImage} alt="Árbol" className={styles.image} />
      </div>
      <div className={styles.info}>
        <h3>Árbol #{tree.id}</h3>
        <p>A la espera de una tarea...</p>
        <div className={styles.durability}>
          <span>Durabilidad: {`${tree.durability}/${tree.maxDurability}`}</span>
        </div>
        <div className={styles.actions}>
          <button onClick={() => handleAssignTask('food')}>Recolectar 🍎</button>
          <button onClick={() => handleAssignTask('wood')}>Talar 🪓</button>
        </div>
      </div>
    </div>
  );
};