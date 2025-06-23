import styles from './VillagersDashboard.module.css';

const VillagersDashboard = () => {
  return (
    <div className={styles.container}>
      <h2>Aldea</h2>
      <p>
        Aquí gestionarás a tus aldeanos. A medida que tu población crezca, 
        podrás asignarles tareas para impulsar el progreso de tu civilización.
      </p>
      <div className={styles.placeholder}>
        <p>Actualmente no tienes ningún aldeano.</p>
        <p>¡Sigue explorando para encontrar a los primeros miembros de tu tribu!</p>
      </div>
    </div>
  );
};

export default VillagersDashboard;