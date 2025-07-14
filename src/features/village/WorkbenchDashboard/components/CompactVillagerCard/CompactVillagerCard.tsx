import { useDraggable } from "@dnd-kit/core";
import styles from "./CompactVillagerCard.module.css";
import type { Villager } from "../../../../../store/slices/villagersSlice";
import villagerMImage from "@assets/villagers/villagerMReduced.png";
import villagerFImage from "@assets/villagers/villagerFReduced.png";

interface CompactVillagerCardProps {
  villager: Villager;
}

export const CompactVillagerCard = ({ villager }: CompactVillagerCardProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `villager-${villager.id}`,
    data: { villager }, // Pasamos el aldeano completo en los datos
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={styles.card}
    >
      <img
        src={villager.sex === "male" ? villagerMImage : villagerFImage}
        alt="Aldeano"
        className={styles.workerIcon}
      />
      <span className={styles.villagerName}>{villager.name}</span>
    </div>
  );
};
