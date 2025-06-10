// src/components/molecules/Tabs/Tabs.tsx
import styles from './Tabs.module.css';

// Definimos la forma que tendrá cada objeto de pestaña en nuestro array
export interface TabItem {
  id: string; // Un identificador único para cada pestaña
  label: string; // El texto que se mostrará
}

// Definimos las props que nuestro componente Tabs espera recibir
interface TabsProps {
  tabs: TabItem[]; // Un array de objetos de tipo TabItem
  activeTab: string; // El 'id' de la pestaña que está activa actualmente
  onTabClick: (tabId: string) => void; // Una función que se llamará cuando se haga clic en una pestaña
}

const Tabs = ({ tabs, activeTab, onTabClick }: TabsProps) => {
  return (
    <nav className={styles.tabsContainer}>
      {/* Usamos .map() para iterar sobre el array 'tabs' y crear un botón por cada una */}
      {tabs.map((tab) => (
        <button
          key={tab.id} // 'key' es una prop especial en React para identificar elementos en una lista
          // Componemos las clases CSS. Si el id de esta pestaña es el mismo que el 'activeTab',
          // le añadimos la clase 'active' para resaltarla.
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          // Cuando se hace clic en este botón, llamamos a la función onTabClick y le pasamos el id de esta pestaña
          onClick={() => onTabClick(tab.id)}
        >
          {tab.label} {/* Mostramos el texto de la pestaña */}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;