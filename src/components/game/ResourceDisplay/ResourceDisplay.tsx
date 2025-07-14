import { useGameStore } from "../../../store/gameStore";
import styles from "./ResourceDisplay.module.css";
import { GiWoodBeam, GiMeat , GiStoneBlock } from "react-icons/gi";
import { IoIosPeople } from "react-icons/io";
export const ResourceDisplay = () => {
  // Seleccionamos solo los recursos que necesitamos del store.
  // Usar un selector así es más eficiente, ya que el componente solo se
  // volverá a renderizar si uno de estos tres valores cambia.
  const wood = useGameStore((state) => state.wood);
  const food = useGameStore((state) => state.food);
  const stone = useGameStore((state) => state.stone);
  const totalVillagers = useGameStore((state) => state.villagers.length);
  const freeVillagers = useGameStore((state) => state.villagers.filter((v) => v.assignedTask === null).length);

  const hasResourcesToShow = wood > 0 || food > 0 || stone > 0 || totalVillagers > 0;

  if (!hasResourcesToShow) {
    return null;
  }
  return (
    <div className={styles.resourcePanel}>
      {wood > 0 && (
        <div className={styles.resourceItem}>
          <GiWoodBeam className={styles.icon} />
          <span className={styles.name}>Madera</span>
          <span className={styles.value}>{Math.floor(wood)}</span>
        </div>
      )}
      {food > 0 && (
        <div className={styles.resourceItem}>
          <GiMeat className={styles.icon} />
          <span className={styles.name}>Comida</span>
          <span className={styles.value}>{Math.floor(food)}</span>
        </div>
      )}
      {stone > 0 && (
      <div className={styles.resourceItem}>
        <GiStoneBlock className={styles.icon} />
        <span className={styles.name}>Piedra</span>
        <span className={styles.value}>{Math.floor(stone)}</span>
      </div>
      )}
            {totalVillagers > 0 && (
        <div className={styles.resourceItem}>
          <IoIosPeople className={styles.icon} />
          <span className={styles.name}>Aldeanos</span>
          <span className={styles.value}>{totalVillagers}</span>
        </div>
      )}
            {totalVillagers > 0 && (
        <div className={styles.resourceItem}>
          <IoIosPeople className={styles.icon} />
          <span className={styles.name}>Ocupación</span>
          <span className={styles.value}>{`${freeVillagers}/${totalVillagers}`}</span>
        </div>
      )}
    </div>
  );
};
