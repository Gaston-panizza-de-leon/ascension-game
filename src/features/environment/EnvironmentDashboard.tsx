import { useState } from 'react';
import Tabs, { type TabItem } from '../../components/molecules/Tabs/Tabs';
import TreesDashboard from './TreesDashboard/TreesDashboard';

const environmentTabs: TabItem[] = [
  { id: 'arboles', label: 'Árboles' },
  // { id: 'rio', label: 'Río' }, // <-- Futuro
  // { id: 'montana', label: 'Montaña' }, // <-- Futuro
];

const EnvironmentDashboard = () => {
  const [activeSubTab, setActiveSubTab] = useState('arboles');

  const renderContent = () => {
    switch (activeSubTab) {
      case 'arboles':
        return <TreesDashboard />;
      // case 'rio':
      //   return <RiverDashboard />;
      default:
        return <TreesDashboard />;
    }
  };

  return (
    <div>
      <Tabs
        tabs={environmentTabs}
        activeTab={activeSubTab}
        onTabClick={setActiveSubTab}
      />
      <div className="sub-tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default EnvironmentDashboard;