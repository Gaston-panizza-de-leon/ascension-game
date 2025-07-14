import { useGameStore } from "../../../../../store/gameStore";
import { getBuildingImagePath } from "../../../../../utils/imageService";
import styles from "./BuildingCard.module.css";
import { FaArrowUp } from 'react-icons/fa';
import { GiWoodBeam } from "react-icons/gi";

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
 const imagePath = getBuildingImagePath(blueprint.id);

  const handleBuildClick = () => {
    startConstruction(blueprint.id);
  };

    return (
    <div className={`${styles.card} ${isUnderConstruction ? styles.inProgress : ''}`}>
      {builtCount > 0 && (
        <button className={styles.upgradeButton} title="Mejorar Edificio (Próximamente)">
          <FaArrowUp />
        </button>
      )}

      <div className={styles.imageContainer}>
        <img src={imagePath} alt={blueprint.name} className={styles.image} />
        {blueprint.isScalable && (
          <div className={styles.builtCounter} title={`Tienes ${builtCount} ${blueprint.name}(s)`}>
            {builtCount}
          </div>
        )}
      </div>

      <div className={styles.contentContainer}>
        <h3 className={styles.title}>{blueprint.name}</h3>

        <div className={styles.progressSection}>
          {isUnderConstruction && activeConstruction ? (
            // --- VISTA DE PROGRESO ---
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBar}
                style={{ width: `${activeConstruction.progress}%` }}
              />
              <span className={styles.progressText}>{Math.floor(activeConstruction.progress)}%</span>
            </div>
          ) : (
            // --- VISTA DE COSTE (NUEVA) ---
            <div className={styles.costContainer}>
              <span className={styles.costLabel}>Coste:</span>
              <div className={styles.costItem}>
                <GiWoodBeam className={styles.costIcon} />
                <span>{blueprint.cost.wood}</span>
              </div>
              {/* Aquí podrías añadir más costes en el futuro */}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.buildButton}
            onClick={handleBuildClick}
            disabled={isUnderConstruction || !hasEnoughResources || (builtCount > 0 && !blueprint.isScalable)}
          >
            Construir {/* <-- Texto simplificado */}
          </button>
        </div>
      </div>
    </div>
  );
};
