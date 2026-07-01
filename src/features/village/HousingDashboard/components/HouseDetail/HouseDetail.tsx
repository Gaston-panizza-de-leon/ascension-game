// src/features/village/HousingDashboard/components/HouseDetail/HouseDetail.tsx
import { useGameStore } from '../../../../../store/gameStore';
import { VillagerCard } from '../../../../village/VillagersDashboard/components/VillagerCard/VillagerCard';
import styles from './HouseDetail.module.css';

interface HouseDetailProps {
  houseId: number; 
}

export function HouseDetail({ houseId }: HouseDetailProps) {
  const villagers = useGameStore((state) => state.villagers);

  const houses = useGameStore((state) =>  state.houses );

  const residentIds = () => {
    const house = houses.find((h) => h.id === houseId);
    const ownerIds = house?.ownerIds || [];
    const visitorsIds = house?.residentIds || [];
    return [...visitorsIds, ...ownerIds];
  };

  const residents = villagers.filter((villager) => residentIds().includes(villager.id));

  return (
    <div className={styles.container}>
      {residents.length > 0 ? (
        <div className={styles.villagerList}>
          {/* Mapeamos los residentes */}
          {residents.map((villager) => (
            <VillagerCard key={villager.id} villager={villager} />
          ))}
        </div>
      ) : (
        // Mostramos un mensaje si la casa está vacía
        <p className={styles.emptyMessage}>Esta casa está desocupada.</p>
      )}
    </div>
  );
}