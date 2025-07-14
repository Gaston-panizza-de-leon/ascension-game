import houseImage from '../assets/buildings/WoodenHouse.png';

// 2. Creamos un "mapa" que conecta el ID del edificio con su imagen importada.
// Usamos Record<string, string> para decirle a TypeScript que es un diccionario.
const buildingImageMap: Record<string, string> = {
  HOUSE: houseImage,
  // WORKSHOP: workshopImage, // <-- Ejemplo futuro
};

/**
 * Devuelve la ruta de la imagen optimizada para un ID de edificio dado.
 * @param buildingId El ID del edificio (ej: "HOUSE").
 * @returns La ruta a la imagen procesada por Vite, o una ruta por defecto si no se encuentra.
 */
export const getBuildingImagePath = (buildingId: string): string => {
  return buildingImageMap[buildingId] || '/default_building.png'; // Devolvemos la imagen o un placeholder
};