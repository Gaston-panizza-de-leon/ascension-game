//import styles from './VillageDashboard.module.css';
import { useState } from 'react';
import Tabs, { type TabItem } from '../../components/molecules/Tabs/Tabs';
import VillagersDashboard from './VillagersDashboard/VillagersDashboard';
import WorkbenchDashboard from './WorkbenchDashboard/WorkbenchDashboard';
import BuildingsDashboard from './BuildingsDashboard/BuildingsDashboard';
import HousingDashboard from './HousingDashboard/HousingDashboard';
import AdministrationDashboard from './AdministrationDashboard/AdministrationDashboard'; 

const villageTabs: TabItem[] = [
  { id: 'aldeanos', label: 'Aldeanos' },
  { id: 'trabajo', label: 'Banco de Trabajo' },
  { id: 'edificios', label: 'Panel de Construcción' },
  { id: 'viviendas', label: 'Panel de Viviendas' },
  { id: 'gobernanza', label: 'Gobernanza' } // Nueva pestaña para administración
];

const VillageDashboard = () => {
    const [activeSubTab, setActiveSubTab] = useState('aldeanos');

    const renderContent = () => {
        switch (activeSubTab) {
            case 'aldeanos':
                return <VillagersDashboard />;
            case 'trabajo':
                return <WorkbenchDashboard />;
            case 'edificios':
                return <BuildingsDashboard />;
            case 'viviendas':
                return <HousingDashboard />;
            case 'gobernanza':
                return <AdministrationDashboard />;
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