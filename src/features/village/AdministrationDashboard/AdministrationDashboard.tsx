// En: src/components/PolicyPanel.tsx

import { useGameStore } from '../../../store/gameStore';
import styles from './AdministrationDashboard.module.css';

// Definimos las políticas fuera para poder iterar sobre ellas
const policies = [
  {
    id: 'Triage',
    title: 'Triaje',
    description: 'Prioriza a los más hambrientos para asegurar la supervivencia de todos.'
  },
  {
    id: 'SurvivalOfTheFittest',
    title: 'Ley del Fuerte',
    description: 'Asegura que los aldeanos sanos y productivos coman primero.'
  }
];

export const AdministrationDashboard = () => {
  // Obtenemos el estado actual y la función para cambiarlo desde Zustand
  const foodPolicy = useGameStore(state => state.foodPolicy);
  const setFoodPolicy = useGameStore(state => state.setFoodPolicy);

  return (
    <div className={styles.policySection}>
      <h3 className={styles.sectionTitle}>Política de Raciones</h3>
      <div className={styles.optionsGroup}>
        {policies.map(policy => (
          <label key={policy.id} className={styles.policyOption}>
            <input 
              type="radio" 
              name="foodPolicy"
              value={policy.id}
              checked={foodPolicy === policy.id}
              onChange={() => setFoodPolicy(policy.id as 'Triage' | 'SurvivalOfTheFittest')}
            />
            <span className={styles.radioCircle}></span>
            <div className={styles.optionTextContainer}>
              <span className={styles.optionTitle}>{policy.title}</span>
              <span className={styles.optionDescription}>{policy.description}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default AdministrationDashboard;