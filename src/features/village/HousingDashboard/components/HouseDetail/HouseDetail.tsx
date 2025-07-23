// src/features/village/HousingDashboard/components/HouseDetail/HouseDetail.tsx
import { useGameStore } from '../../../../../store/gameStore';
import { VillagerCard } from '../../../../village/VillagersDashboard/components/VillagerCard/VillagerCard';
import styles from './HouseDetail.module.css';

interface HouseDetailProps {
  houseId: number; // El ID ahora es un número
}

export function HouseDetail({ houseId }: HouseDetailProps) {
  // 1. Obtenemos TODOS los aldeanos del store
  const villagers = useGameStore((state) => state.villagers);

  // 2. Obtenemos los IDs de los residentes de ESTA casa desde el slice de village
  const houses = useGameStore((state) =>  state.houses );

  const residentIds = () => {
    const house = houses.find((h) => h.id === houseId);
    const ownerIds = house?.ownerIds || [];
    const visitorsIds = house?.residentIds || [];
    return [...visitorsIds, ...ownerIds];
  };

  // 3. Filtramos los aldeanos que están en residentIds
  const residents = villagers.filter((villager) => residentIds().includes(villager.id));

  return (
    <div className={styles.container}>
      {residents.length > 0 ? (
        <div className={styles.villagerList}>
          {/* 3. Mapeamos los residentes y reutilizamos VillagerCard */}
          {residents.map((villager) => (
            <VillagerCard key={villager.id} villager={villager} />
          ))}
        </div>
      ) : (
        // 4. Mostramos un mensaje si la casa está vacía
        <p className={styles.emptyMessage}>Esta casa está desocupada.</p>
      )}
    </div>
  );
}