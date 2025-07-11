import buildingBlueprints from '../../../data/buildings.json';
import { BuildingCard } from './components/BuildingCard/BuildingCard';
import styles from './BuildingsDashboard.module.css';

export const BuildingsDashboard = () => {
  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>Proyectos de Construcción</h2>
      <div className={styles.buildingList}>
        {buildingBlueprints.map((blueprint) => (
          <BuildingCard key={blueprint.id} blueprint={blueprint} />
        ))}
        {/* Aquí se podrían añadir en el futuro los planos de edificios investigados */}
      </div>
    </div>
  );
};
export default BuildingsDashboard;