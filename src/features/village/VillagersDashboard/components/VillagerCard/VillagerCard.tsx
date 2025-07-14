import type { Villager } from "../../../../../store/slices/villagersSlice";
import styles from "./VillagerCard.module.css";
import villagerMImage from "@assets/villagerM.png";
import villagerFImage from "@assets/villagerF.png"; // Asegúrate de que estas imágenes existan en tu carpeta de assets

interface VillagerCardProps {
  villager: Villager;
}

export const VillagerCard = ({ villager }: VillagerCardProps) => {
  // Lógica simple para seleccionar una imagen genérica.
  // Asumimos que tendrás imágenes como 'male.png' y 'female.png' en la carpeta public.

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={villager.sex === "male" ? villagerMImage : villagerFImage}
          alt={`Retrato de ${villager.name}`}
          className={styles.villagerImage}
        />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.villagerName}>{villager.name}</h3>
        <p className={styles.villagerDescription}>
          Un miembro valioso de tu creciente asentamiento, lleno de potencial y
          listo para contribuir al futuro de la civilización.
        </p>
      </div>
    </div>
  );
};
