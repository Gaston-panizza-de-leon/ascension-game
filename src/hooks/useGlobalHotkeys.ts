// En: src/hooks/useGlobalHotkeys.ts

import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const useGlobalHotkeys = () => {
  // Obtenemos la acción directamente para evitar referencias inestables
  const togglePause = useGameStore.getState().togglePause;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Usamos un switch porque es mucho más escalable que un if/else
      switch (event.code) {
        case 'Space':
          // Evitamos que la página haga scroll al pulsar espacio
          event.preventDefault(); 
          togglePause();
          break;

        // --- ¡PREPARADO PARA EL FUTURO! ---
        // case 'KeyM':
        //   event.preventDefault();
        //   openMap(); // Imagina que tienes una acción para abrir el mapa
        //   break;
        // case 'Digit1':
        //   selectBuilding(1); // O para seleccionar algo con las teclas numéricas
        //   break;

        default:
          // No hacemos nada para otras teclas
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Limpiamos el listener al desmontar el componente para evitar fugas de memoria
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  // Pasamos las acciones como dependencias para que el hook se actualice si estas cambian
  }, [togglePause]);
};