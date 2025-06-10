// src/App.tsx
import { useState } from 'react'; // 1. Importa useState
import ExplorationDashboard from './features/exploration/ExplorationDashboard';
import EnvironmentDashboard from './features/environment/EnvironmentDashboard'; // 2. Importa el nuevo dashboard
import Tabs, { type TabItem } from './components/molecules/Tabs/Tabs.jsx'; // 3. Importa el componente Tabs
import './App.css';

// Definimos los tabs que usará nuestra aplicación
const mainTabs: TabItem[] = [
  { id: 'exploracion', label: 'Exploración' },
  { id: 'entorno', label: 'Entorno' },
];

function App() {
  // 4. Creamos una variable de estado para guardar el ID de la pestaña activa.
  //    Por defecto, empezamos en 'exploracion'.
  const [activeTab, setActiveTab] = useState('exploracion');

  // 5. Función para renderizar el contenido de la pestaña activa
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'exploracion':
        return <ExplorationDashboard />;
      case 'entorno':
        return <EnvironmentDashboard />;
      default:
        return <ExplorationDashboard />; // Por si acaso, muestra exploración
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ascension Game</h1>
        {/* Aquí podría ir el panel de recursos en el futuro */}
      </header>

      <main>
        {/* 6. Renderizamos nuestro componente de Tabs */}
        <Tabs
          tabs={mainTabs}
          activeTab={activeTab}
          onTabClick={setActiveTab} // Le pasamos la función para cambiar el estado
        />

        {/* 7. Renderizamos el contenido de la pestaña activa */}
        <div className="tab-content">
          {renderActiveTabContent()}
        </div>
      </main>
    </div>
  );
}

export default App;