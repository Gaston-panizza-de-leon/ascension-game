import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useGameStore } from '../../../store/gameStore';
import { type VillagerTask } from '../../../store/slices/villagersSlice';
import { CompactVillagerCard } from './components/CompactVillagerCard/CompactVillagerCard';
import { JobColumn } from './components/JobColumn/JobColumn';
import styles from './WorkbenchDashboard.module.css';

const WorkbenchDashboard = () => {
 const villagers = useGameStore((state) => state.villagers);
 const trees = useGameStore((state) => state.trees);
 const assignTaskToVillager = useGameStore((state) => state.assignTaskToVillager);


  // Filtramos aldeanos por estado
  const unemployedVillagers = villagers.filter((v) => !v.assignedTask);
  const employedVillagers = villagers.filter((v) => v.assignedTask);

  // Lógica para saber si las columnas de tala/recolección están llenas
  const woodTrees = trees.filter(t => t.taskType === 'wood');
  const foodTrees = trees.filter(t => t.taskType === 'food');
  const woodJobsOccupied = employedVillagers.filter(v => v.assignedTask?.type === 'wood').length;
  const foodJobsOccupied = employedVillagers.filter(v => v.assignedTask?.type === 'food').length;
  const isWoodColumnFull = woodJobsOccupied >= woodTrees.length;
  const isFoodColumnFull = foodJobsOccupied >= foodTrees.length;

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    const villagerId = parseInt(active.id.toString().replace('villager-', ''));

    // Si no se suelta sobre una columna válida, o se suelta sobre la de desempleados, se desasigna
    if (!over || over.id === 'unemployed') {
      assignTaskToVillager(villagerId, null);
      return;
    }
    
    // Asignar a una nueva tarea
    let task: VillagerTask | null = null;
    switch (over.id) {
      case 'explore':
        task = { type: 'exploration' };
        break;
      case 'chop':
        // Encontramos el primer árbol de tala libre
        { const freeWoodTree = woodTrees.find(tree => 
          !employedVillagers.some(v => v.assignedTask?.targetId === tree.id)
        );
        if (freeWoodTree) task = { type: 'wood', targetId: freeWoodTree.id };
        break; }
      case 'gather':
        // Encontramos el primer árbol de comida libre
        { const freeFoodTree = foodTrees.find(tree => 
          !employedVillagers.some(v => v.assignedTask?.targetId === tree.id)
        );
        if (freeFoodTree) task = { type: 'food', targetId: freeFoodTree.id };
        break; }
    }
    
    if (task) {
        assignTaskToVillager(villagerId, task);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className={styles.container}>
        <JobColumn id="unemployed" title="Desempleados">
          {unemployedVillagers.map((v) => <CompactVillagerCard key={v.id} villager={v} />)}
        </JobColumn>

        <div className={styles.separator}></div>
        
        <div className={styles.jobsArea}>
            <JobColumn id="explore" title="🗺️ Explorar">
                {employedVillagers.filter(v => v.assignedTask?.type === 'exploration').map(v => 
                    <CompactVillagerCard key={v.id} villager={v} />
                )}
            </JobColumn>
            <JobColumn id="chop" title="🪓 Talar" isFull={isWoodColumnFull}>
                 {employedVillagers.filter(v => v.assignedTask?.type === 'wood').map(v => 
                    <CompactVillagerCard key={v.id} villager={v} />
                )}
            </JobColumn>
            <JobColumn id="gather" title="🍎 Recolectar" isFull={isFoodColumnFull}>
                 {employedVillagers.filter(v => v.assignedTask?.type === 'food').map(v => 
                    <CompactVillagerCard key={v.id} villager={v} />
                )}
            </JobColumn>
        </div>
      </div>
    </DndContext>
  );
};
export default WorkbenchDashboard;