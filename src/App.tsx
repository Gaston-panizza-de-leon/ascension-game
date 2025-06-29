// src/App.tsx
import { useState } from 'react'; // 1. Importa useState
import ExplorationDashboard from './features/exploration/ExplorationDashboard';
import EnvironmentDashboard from './features/environment/EnvironmentDashboard.tsx';
import Tabs, { type TabItem } from './components/molecules/Tabs/Tabs.tsx';
import { ResourceDisplay } from './components/game/ResourceDisplay/ResourceDisplay.tsx';
import VillageDashboard from './features/village/VillageDashBoard.tsx';
import { TimeDisplay } from './components/game/TimeDisplay/TimeDisplay.tsx';
import './App.css';

const mainTabs: TabItem[] = [
  { id: 'exploracion', label: 'Exploración' },
  { id: 'entorno', label: 'Entorno' },
  { id: 'aldea', label: 'Aldea' },
];

function App() {

  const [activeTab, setActiveTab] = useState('exploracion');


  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'exploracion':
        return <ExplorationDashboard />;
      case 'entorno':
        return <EnvironmentDashboard />;
      case 'aldea':
        return <VillageDashboard />;
      default:
        return <ExplorationDashboard />;
    }
  };

  return (
    <div className="App">
      <header className="App-header"> 
        <h1>Ascension Game</h1>
      </header>
      <TimeDisplay />
      <ResourceDisplay />
      <main>
        <Tabs
          tabs={mainTabs}
          activeTab={activeTab}
          onTabClick={setActiveTab}
        />
        <div className="tab-content">
          {renderActiveTabContent()}
        </div>
      </main>
    </div>
  );
}

export default App;