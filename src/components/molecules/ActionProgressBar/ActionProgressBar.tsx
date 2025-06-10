// src/components/molecules/ActionProgressBar/ActionProgressBar.tsx
import styles from './ActionProgressBar.module.css';

interface ActionProgressBarProps {
  progress: number;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
}

const ActionProgressBar = ({
  progress,
  label,
  onClick,
  disabled = false,
  isActive = false,
}: ActionProgressBarProps) => {
  const barStyle = {
    width: `${progress}%`,
  };

  return (
    <button
      className={`${styles.actionProgressBar} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className={styles.progressFill} style={barStyle}></div>
      <span className={styles.label}>{label}</span>
    </button>
  );
};

export default ActionProgressBar;