import { useState } from 'react';
import { useGameStore } from '../../../store/gameStore';
import { HouseCard } from './components/HouseCard/HouseCard';
import styles from './HousingDashboard.module.css';
import { Modal } from '../../../components/ui/Modal/Modal';
import { HouseDetail } from './components/HouseDetail/HouseDetail';



export const HousingDashboard = () => {
  const houses = useGameStore((state) => state.houses);
  const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);

  const selectedHouse = houses.find(h => h.id === selectedHouseId);
  const selectedBuildingId = selectedHouse ? selectedHouse.buildingId : null;

  const handleCloseModal = () => {
    setSelectedHouseId(null);
  };

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>Tu Aldea</h2>

      {houses.length > 0 ? (
        <div className={styles.houseGrid}>
          {houses.map((house) => (
            <HouseCard key={house.id} house={house}
              onClick={() => setSelectedHouseId(house.id)} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>Tu asentamiento aún no tiene viviendas.</p>
          <p>Ve a la pestaña de "Construcción" para empezar a construir tu primera casa.</p>
        </div>
      )}
      <Modal
        isOpen={!!selectedHouseId}
        onClose={handleCloseModal}
        title={selectedBuildingId ? `Residentes (${selectedBuildingId})` : 'Casa'}
      >
        {selectedHouseId !== null && <HouseDetail houseId={selectedHouseId} />}
      </Modal>
    </div>
  );
};

export default HousingDashboard;