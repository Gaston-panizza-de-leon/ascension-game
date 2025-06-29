import { useGameStore } from '../../../store/gameStore';
import styles from './TimeDisplay.module.css';

export const TimeDisplay = () => {
    const currentDay = useGameStore((state) => state.currentDay);
    const timeOfDayProgress = useGameStore((state) => state.timeOfDayProgress);

    // Calculamos el ancho de la barra de progreso
    const progressPercentage = timeOfDayProgress * 100;

    return (
        <div className={styles.panel}>
            <div className={styles.dayCounter}>
                <span className={styles.dayIcon}>☀️</span>
                Día {currentDay}
            </div>
            <div className={styles.progressBarContainer}>
                <div 
                    className={styles.progressBar} 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};
