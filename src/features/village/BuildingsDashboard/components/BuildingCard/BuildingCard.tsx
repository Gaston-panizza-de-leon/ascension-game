import { useGameStore } from "../../../../../store/gameStore";
import styles from "./BuildingCard.module.css";

// La plantilla de un edificio, lo que viene de buildings.json
interface Blueprint {
  id: string;
  name: string;
  description: string;
  isScalable: boolean;
  cost: {
    wood: number;
  };
  baseConstructionTime: number;
}

interface BuildingCardProps {
  blueprint: Blueprint;
}

export const BuildingCard = ({ blueprint }: BuildingCardProps) => {
  // Obtenemos los datos relevantes del store de Zustand
    // Extraemos los datos del store de Zustand sin usar blueprint en el selector
  const builtCount = useGameStore((state) => state.builtBuildings[blueprint.id] || 0);
  const activeConstruction = useGameStore((state) => state.activeConstruction);
  const startConstruction = useGameStore((state) => state.startConstruction);
  const wood = useGameStore((state) => state.wood);

  const isUnderConstruction = activeConstruction?.buildingId === blueprint.id;
  const hasEnoughResources = wood >= blueprint.cost.wood;

  const handleBuildClick = () => {
    startConstruction(blueprint.id);
  };

  return (
    <div
      className={`${styles.card} ${
        isUnderConstruction ? styles.inProgress : ""
      }`}
    >
      {/* --- ZONA IZQUIERDA: IDENTIDAD Y ESTADO --- */}
      <div className={styles.identity}>
        <img
          src={`/buildings/${blueprint.id.toLowerCase()}.png`}
          alt={blueprint.name}
          className={styles.image}
        />
        <div className={styles.nameContainer}>
          <h3 className={styles.name}>{blueprint.name}</h3>
          {blueprint.isScalable && (
            <span className={styles.counter}>Construidas: {builtCount}</span>
          )}
          {!blueprint.isScalable && builtCount > 0 && (
            <span className={`${styles.counter} ${styles.built}`}>
              Construido
            </span>
          )}
        </div>
      </div>

      {/* --- ZONA CENTRAL: PROGRESO --- */}
      <div className={styles.progressSection}>
        {isUnderConstruction && activeConstruction && (
          <>
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBar}
                style={{ width: `${activeConstruction.progress}%` }}
              />
              <span className={styles.progressText}>
                {Math.floor(activeConstruction.progress)}%
              </span>
            </div>
            <span className={styles.progressInfo}>Construyendo...</span>
          </>
        )}
      </div>

      {/* --- ZONA DERECHA: ACCIONES --- */}
      <div className={styles.actions}>
        <button
          className={styles.buildButton}
          onClick={handleBuildClick}
          disabled={
            isUnderConstruction ||
            !hasEnoughResources ||
            (builtCount > 0 && !blueprint.isScalable)
          }
        >
          Construir (🪓 {blueprint.cost.wood})
        </button>
        {/* El botón de mejora irá aquí en el futuro */}
      </div>
    </div>
  );
};
