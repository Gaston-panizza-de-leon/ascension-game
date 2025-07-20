import type { HouseInstance } from '../../../../../store/slices/villageSlice';
import styles from './HouseCard.module.css';
import { IoHome, IoPeople } from 'react-icons/io5'; // Usamos iconos para la UI

interface HouseCardProps {
  house: HouseInstance;
}

export const HouseCard = ({ house }: HouseCardProps) => {
  const residentCount = house.residentIds.length;
  const capacity = 4; // Capacidad máxima de una casa

  // Lógica para determinar si la casa está llena
  const isFull = residentCount >= capacity;

  return (
    // En el futuro, un onClick aquí podría abrir un modal con detalles
    <div className={`${styles.card} ${isFull ? styles.full : ''}`}>
      <div className={styles.header}>
        <IoHome className={styles.houseIcon} />
        <h3 className={styles.title}>Casa #{house.id}</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.populationInfo}>
          <IoPeople className={styles.populationIcon} />
          <span>{residentCount} / {capacity}</span>
        </div>
        {/* Aquí en el futuro podríamos mostrar pequeños avatares de los residentes */}
      </div>
    </div>
  );
};