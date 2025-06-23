//import styles from './VillageDashboard.module.css';
import { useState } from 'react';
import Tabs, { type TabItem } from '../../components/molecules/Tabs/Tabs';
import VillagersDashboard from './VillagersDashboard/VillagersDashboard';
import WorkbenchDashboard from './WorkbenchDashboard/WorkbenchDashboard';

const villageTabs: TabItem[] = [
  { id: 'aldeanos', label: 'Aldeanos' },
  { id: 'trabajo', label: 'Banco de Trabajo' }
];

const VillageDashboard = () => {
    const [activeSubTab, setActiveSubTab] = useState('aldeanos');

    const renderContent = () => {
        switch (activeSubTab) {
            case 'aldeanos':
                return <VillagersDashboard />;
            case 'trabajo':
                return <WorkbenchDashboard />;
            default:
                return null;
        }
    }
    return (
        <div>
            <Tabs
                tabs={villageTabs}
                activeTab={activeSubTab}
                onTabClick={setActiveSubTab}
            />
            <div className="sub-tab-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default VillageDashboard;