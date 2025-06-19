import { useGameStore } from "../../../store/gameStore";
import styles from "./ResourceDisplay.module.css";

export const ResourceDisplay = () => {
  // Seleccionamos solo los recursos que necesitamos del store.
  // Usar un selector así es más eficiente, ya que el componente solo se
  // volverá a renderizar si uno de estos tres valores cambia.
  const wood = useGameStore((state) => state.wood);
  const food = useGameStore((state) => state.food);
  const stone = useGameStore((state) => state.stone);

  return (
    // Ahora es un panel que contendrá la lista de recursos
    <div className={styles.resourcePanel}>
      <div className={styles.resourceItem}>
        <span className={styles.icon}>🪓</span>
        <span className={styles.name}>Madera</span>
        <span className={styles.value}>{Math.floor(wood)}</span>
      </div>
      <div className={styles.resourceItem}>
        <span className={styles.icon}>🍎</span>
        <span className={styles.name}>Comida</span>
        <span className={styles.value}>{Math.floor(food)}</span>
      </div>
      <div className={styles.resourceItem}>
        <span className={styles.icon}>💎</span>
        <span className={styles.name}>Piedra</span>
        <span className={styles.value}>{Math.floor(stone)}</span>
      </div>
    </div>
  );
};
