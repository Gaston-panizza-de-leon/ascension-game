import { useGameStore } from '../../../store/gameStore';
import { TreeCard } from '../components/TreeCard/TreeCard';
import styles from './EnvironmentDashboard.module.css';

const EnvironmentDashboard = () => {
  // Sacamos los árboles y la acción para asignar tareas del store
  const trees = useGameStore((state) => state.trees);
  const assignTaskToTree = useGameStore((state) => state.assignTaskToTree);

  return (
    <div>
      <h2>Entorno</h2>
      <p>
        Recursos descubiertos. Asigna tareas para recolectar materiales.
      </p>
      
      {/* Aquí podrías tener las sub-pestañas en el futuro */}
      <div className={styles.cardsContainer}>
        {trees.length === 0 ? (
          <p>No has descubierto ningún recurso todavía.</p>
        ) : (
          trees.map((tree) => (
            <TreeCard 
              key={tree.id} 
              tree={tree} 
              onAssignTask={assignTaskToTree} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EnvironmentDashboard;