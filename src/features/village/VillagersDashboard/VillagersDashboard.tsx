import { useGameStore } from '../../../store/gameStore';
import { VillagerCard } from './components/VillagerCard/VillagerCard';
import styles from './VillagersDashboard.module.css';

export const VillagersDashboard = () => {
  const villagers = useGameStore((state) => state.villagers);

  return (
    <div className={styles.dashboardContainer}>
      {villagers.length === 0 ? (
        <p className={styles.noVillagersMessage}>Aún no has descubierto a ningún aldeano. ¡Sigue explorando!</p>
      ) : (
        <div className={styles.villagersGrid}>
          {villagers.map((villager) => (
            <VillagerCard key={villager.id} villager={villager} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VillagersDashboard;