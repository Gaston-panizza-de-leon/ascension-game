import { useGameStore } from '../../../store/gameStore';
import styles from './TimeDisplay.module.css';
import { GiSun } from "react-icons/gi";

export const TimeDisplay = () => {
    const currentDay = useGameStore((state) => state.currentDay);
    const timeOfDayProgress = useGameStore((state) => state.timeOfDayProgress);

    // Calculamos el ancho de la barra de progreso
    const progressPercentage = timeOfDayProgress * 100;

    return (
        <div className={styles.panel}>
            <div className={styles.dayCounter}>
                <GiSun className={styles.dayIcon} />
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
