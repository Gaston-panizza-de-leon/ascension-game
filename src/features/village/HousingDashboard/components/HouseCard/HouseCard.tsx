import type { HouseInstance } from '../../../../../store/slices/villageSlice';
import styles from './HouseCard.module.css';
import { IoHome, IoPeople } from 'react-icons/io5'; // Usamos iconos para la UI

interface HouseCardProps {
  house: HouseInstance;
  onClick: () => void;
}

export const HouseCard = ({ house, onClick }: HouseCardProps) => {
  const residentCount = house.residentIds.length;
  const realOwnerCount = house.ownerIds.filter(id => id !== null).length;
  const livingResidents = residentCount + realOwnerCount;
  const capacity = 4;

  const isFull = livingResidents >= capacity;

  return (
    <div className={`${styles.card} ${isFull ? styles.full : ''}`} onClick={onClick}>
      <div className={styles.header}>
        <IoHome className={styles.houseIcon} />
        <h3 className={styles.title}>Casa #{house.id}</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.populationInfo}>
          <IoPeople className={styles.populationIcon} />
          <span>{livingResidents} / {capacity}</span>
        </div>
      </div>
    </div>
  );
};