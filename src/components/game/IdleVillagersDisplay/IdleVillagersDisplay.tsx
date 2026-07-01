import { useMemo } from 'react';
import { useGameStore } from '../../../store/gameStore';
import styles from './IdleVillagersDisplay.module.css';

export const IdleVillagersDisplay = () => {
  // 1. Obtenemos la lista completa de aldeanos desde el store.
  const villagers = useGameStore((state) => state.villagers);

  // 2. Usamos 'useMemo' para filtrar la lista de forma eficiente.
  //    Este código solo se re-ejecutará si la lista de 'villagers' cambia.
  const idleVillagers = useMemo(() => {
    return villagers.filter(v => v.assignedTask === null);
  }, [villagers]);

  // 3. Si no hay aldeanos ociosos, no mostramos nada para mantener la UI limpia.
  if (idleVillagers.length === 0) {
    return null;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        Ociosos ({idleVillagers.length})
      </div>
      <ul className={styles.villagerList}>
        {idleVillagers.map((villager) => (
          <li key={villager.id} className={styles.villagerItem}>
            <span>{villager.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IdleVillagersDisplay;