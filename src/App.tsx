// src/App.tsx
import { useState, useEffect } from 'react';
import { useGlobalHotkeys } from './hooks/useGlobalHotkeys.ts';
import ExplorationDashboard from './features/exploration/ExplorationDashboard';
import EnvironmentDashboard from './features/environment/EnvironmentDashboard.tsx';
import Tabs, { type TabItem } from './components/molecules/Tabs/Tabs.tsx';
import { ResourceDisplay } from './components/game/ResourceDisplay/ResourceDisplay.tsx';
import VillageDashboard from './features/village/VillageDashBoard.tsx';
import { TimeDisplay } from './components/game/TimeDisplay/TimeDisplay.tsx';
import { IdleVillagersDisplay } from './components/game/IdleVillagersDisplay/IdleVillagersDisplay.tsx';
import ResetProgress from './components/game/ResetProgress/ResetProgress';
import { saveService } from './utils/saveService';
import { useGameStore } from './store/gameStore';
import './App.css';

const mainTabs: TabItem[] = [
  { id: 'exploracion', label: 'Exploración' },
  { id: 'entorno', label: 'Entorno' },
  { id: 'aldea', label: 'Aldea' },
];

function App() {

  const [activeTab, setActiveTab] = useState('exploracion');

  useGlobalHotkeys();

  useEffect(() => {
    saveService.open()
      .then(() => saveService.loadGame())
      .then((save) => {
        if (save) {
          useGameStore.getState().hydrateFromSave(save);
        }
      })
      .catch(console.error);
  }, []);
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
       <IdleVillagersDisplay />
       <ResetProgress />
    </div>
  );
}

export default App;