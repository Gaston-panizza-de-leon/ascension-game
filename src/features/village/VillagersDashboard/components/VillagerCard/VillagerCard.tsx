import type { Villager } from "../../../../../store/slices/villagersSlice";
import styles from "./VillagerCard.module.css";
import villagerMImage from "@assets/villagers/villagerM.png";
import villagerFImage from "@assets/villagers/villagerF.png";
import villagerMKidImage from "@assets/villagers/villagerMKid.png";
import villagerFKidImage from "@assets/villagers/villagerFKid.png";
import { GiMeat } from 'react-icons/gi';
import { DAYS_PER_YEAR } from "../../../../../store/slices/timeSlice";

interface VillagerCardProps {
  villager: Villager;
}

const getVillagerImage = (villager: Villager) => {
  const ageInYears = Math.floor(villager.age / DAYS_PER_YEAR);
  const isKid = ageInYears < 14;
  if (isKid) {
    return villager.sex === "male" ? villagerMKidImage : villagerFKidImage;
  } else {
    return villager.sex === "male" ? villagerMImage : villagerFImage;
  }
};

export const VillagerCard = ({ villager }: VillagerCardProps) => {
  const getHungerClassName = () => {
    switch (villager.hungerState) {
      case 4: return styles.hungerSaciado;
      case 3: return styles.hungerHambre;
      case 2: return styles.hungerDebil;
      case 1: return styles.hungerFamelico;
      default: return styles.hungerEmpty;
    }
  };

const imageUrl = getVillagerImage(villager);

  const hungerClassName = getHungerClassName();
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={imageUrl}
          alt={`Retrato de ${villager.name}`}
          className={styles.villagerImage}
        />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.villagerName}>{villager.name}</h3>
        <p className={styles.villagerDescription}>
          Edad: {Math.floor(villager.age / DAYS_PER_YEAR)} años
        </p>
      </div>
      <div className={styles.hungerIndicator}>
        {[...Array(4)].map((_, index) => {
          const isFilled = index < villager.hungerState;
          return (
            <GiMeat
              key={index}
              className={`${isFilled ? hungerClassName : styles.emptyIcon} ${styles.baseIcon}`}
            />
          );
        })}
      </div>
    </div>
  );
};
