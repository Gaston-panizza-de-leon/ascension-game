import { useGameStore } from '../../../store/gameStore';
import { HouseCard } from './components/HouseCard/HouseCard';
import styles from './HousingDashboard.module.css';

export const HousingDashboard = () => {
  // Obtenemos la lista de casas directamente de nuestro villageSlice
  const houses = useGameStore((state) => state.houses);

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>Tu Aldea</h2>
      
      {houses.length > 0 ? (
        <div className={styles.houseGrid}>
          {houses.map((house) => (
            <HouseCard key={house.id} house={house} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>Tu asentamiento aún no tiene viviendas.</p>
          <p>Ve a la pestaña de "Construcción" para empezar a construir tu primera casa.</p>
        </div>
      )}
    </div>
  );
};

export default HousingDashboard;