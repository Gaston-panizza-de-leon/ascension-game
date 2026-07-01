import type { VillagerTask, Villager, FoodPolicy } from "../store/slices/villagersSlice";
import type { Tree } from "../store/slices/environmentSlice";
import type { HouseInstance } from "../store/slices/villageSlice";
import type { ActiveConstruction } from "../store/slices/buildingsSlice";

export interface GameSaveData {
  version: number;
  currentDay: number;
  timeOfDayProgress: number;
  wood: number;
  food: number;
  stone: number;
  explorationLevel: number;
  currentXp: number;
  playerTask: VillagerTask | null;
  trees: Tree[];
  villagers: Villager[];
  foodPolicy: FoodPolicy;
  houses: HouseInstance[];
  nextHouseId: number;
  builtBuildings: Record<string, number>;
  activeConstruction: ActiveConstruction | null;
  lastTickTimestamp: number;
  isPaused: boolean;
}

const DB_NAME = "ascension-game";
const DB_VERSION = 1;
const STORE_NAME = "saves";
const SAVE_KEY = "current";

let db: IDBDatabase | null = null;

function open(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

function saveGame(data: GameSaveData): Promise<void> {
  if (!db) return Promise.reject(new Error("DB not open"));
  return new Promise((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(data, SAVE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function loadGame(): Promise<GameSaveData | null> {
  if (!db) return Promise.reject(new Error("DB not open"));
  return new Promise((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(SAVE_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

function deleteSave(): Promise<void> {
  if (!db) return Promise.reject(new Error("DB not open"));
  return new Promise((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(SAVE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function hasSave(): Promise<boolean> {
  if (!db) return Promise.reject(new Error("DB not open"));
  return new Promise((resolve, reject) => {
    const tx = db!.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getKey(SAVE_KEY);
    request.onsuccess = () => resolve(request.result !== undefined);
    request.onerror = () => reject(request.error);
  });
}

export const saveService = {
  open,
  saveGame,
  loadGame,
  deleteSave,
  hasSave,
};
