import styles from './Tabs.module.css';

// Definimos la forma que tendrá cada objeto de pestaña en nuestro array
export interface TabItem {
  id: string;
  label: string;
}

// Definimos las props que nuestro componente Tabs espera recibir
interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
}

const Tabs = ({ tabs, activeTab, onTabClick }: TabsProps) => {
  return (
    <nav className={styles.tabsContainer}>
      {tabs.map((tab) => (
        <button
          key={tab.id} 
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          // Cuando se hace clic en este botón, llamamos a la función onTabClick y le pasamos el id de esta pestaña
          onClick={() => onTabClick(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default Tabs;