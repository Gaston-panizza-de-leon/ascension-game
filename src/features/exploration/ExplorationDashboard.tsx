import { useGameStore } from '../../store/gameStore';
import { calculateXpForLevel } from '../../store/slices/explorationSlice';
import ActionProgressBar from '../../components/molecules/ActionProgressBar/ActionProgressBar';

const ExplorationDashboard = () => {
  // Leemos los datos que necesitamos directamente del store central
  const explorationLevel = useGameStore((state) => state.explorationLevel);
  const currentXp = useGameStore((state) => state.currentXp);
  const playerTask = useGameStore((state) => state.playerTask);
  const setPlayerTask = useGameStore.getState().setPlayerTask;

  // El jugador está explorando si su tarea actual es de tipo 'exploration'
  const isExploring = playerTask?.type === 'exploration';

  const totalXpForLevel = calculateXpForLevel(explorationLevel);
  const progressPercent =
    totalXpForLevel > 0 ? (currentXp / totalXpForLevel) * 100 : 0;
  const label = `${currentXp.toFixed(2)} / ${totalXpForLevel.toFixed(2)} XP`;
  const buttonText = isExploring ? 'Pausar Exploración' : 'Explorar';

  // La acción de explorar ahora simplemente asigna la tarea al jugador
  const toggleExploration = () => {
    setPlayerTask(isExploring ? null : { type: 'exploration' });
  };

  return (
    <div>
      <h2>Exploración (Nivel: {explorationLevel})</h2>
      <ActionProgressBar
        progress={progressPercent}
        label={label}
        onClick={toggleExploration}
        isActive={isExploring}
      />
      <p>{buttonText}</p>
    </div>
  );
};

export default ExplorationDashboard;