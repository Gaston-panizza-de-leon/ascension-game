// src/features/exploration/ExplorationDashboard.tsx

import ActionProgressBar from '../../components/molecules/ActionProgressBar/ActionProgressBar';
import { useExploration } from './useExploration';

const ExplorationDashboard = () => {
  // --- Usamos el hook refactorizado y obtenemos los nuevos datos ---
  const {
    explorationLevel,
    currentXp,
    totalXpForLevel,
    isExploring,
    toggleExploration, // Ahora se llama toggleExploration
  } = useExploration();

  // --- Preparamos los datos para el componente de UI ---

  // Calculamos el progreso en porcentaje para la barra visual
  const progressPercent = (currentXp / totalXpForLevel) * 100;

  // Creamos la etiqueta de texto con el formato "actual / total XP"
  // .toFixed(2) muestra el número con 2 decimales, útil para la XP.
  const label = `${currentXp.toFixed(2)} / ${totalXpForLevel.toFixed(2)} XP`;

  // El texto del botón cambia dependiendo de si estamos explorando o no.
  const buttonText = isExploring ? "Pausar Exploración" : "Explorar";


  return (
    <div>
      <h2>Exploración (Nivel: {explorationLevel})</h2>
      <ActionProgressBar
        progress={progressPercent} // Le pasamos el progreso en %
        label={label}              // Le pasamos el nuevo texto de la etiqueta
        onClick={toggleExploration} // La acción ahora es pausar/reanudar
        // Ya no necesitamos 'disabled', el botón siempre está activo
        isActive={isExploring} // La prop 'isActive' sigue siendo útil para el estilo
      />
      {/* Añadimos el texto del botón debajo para más claridad */}
      <p>{buttonText}</p>
    </div>
  );
};

export default ExplorationDashboard;