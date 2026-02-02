# Ascension Game - Arquitectura del Proyecto

## Estructura de Carpetas y Archivos

```
ascension-game/
│
├── public/
│   └── ascension-game.png                 # Logo/icono del juego
│
├── src/
│   ├── main.tsx                           # Punto de entrada de la aplicación
│   ├── App.tsx                            # Componente raíz con tabs principales
│   ├── App.css                            # Estilos globales de la app
│   ├── index.css                          # Estilos base y reset CSS
│   ├── vite-env.d.ts                      # Tipos de Vite
│   │
│   ├── assets/                            # Recursos gráficos
│   │   ├── buildings/
│   │   │   └── WoodenHouse.png
│   │   ├── environment/
│   │   │   └── tree.png
│   │   └── villagers/
│   │       ├── villagerF.png
│   │       ├── VillagerFKid.png
│   │       ├── villagerFReduced.png
│   │       ├── villagerM.png
│   │       ├── VillagerMKid.png
│   │       └── villagerMReduced.png
│   │
│   ├── components/                        # Componentes reutilizables
│   │   ├── game/                          # Componentes específicos del juego
│   │   │   ├── ResourceDisplay/
│   │   │   │   ├── ResourceDisplay.tsx
│   │   │   │   └── ResourceDisplay.module.css
│   │   │   └── TimeDisplay/
│   │   │       ├── TimeDisplay.tsx
│   │   │       └── TimeDisplay.module.css
│   │   │
│   │   ├── molecules/                     # Componentes de nivel medio
│   │   │   ├── ActionProgressBar/
│   │   │   │   ├── ActionProgressBar.tsx
│   │   │   │   └── ActionProgressBar.module.css
│   │   │   └── Tabs/
│   │   │       ├── Tabs.tsx
│   │   │       └── Tabs.module.css
│   │   │
│   │   └── ui/                            # Componentes UI básicos
│   │       └── Modal/
│   │           ├── Modal.tsx
│   │           └── Modal.module.css
│   │
│   ├── data/                              # Datos estáticos y configuración
│   │   └── buildings.json                 # Plantillas de edificios
│   │
│   ├── features/                          # Módulos funcionales por dominio
│   │   ├── environment/                   # Feature: Entorno natural
│   │   │   ├── EnvironmentDashboard.tsx
│   │   │   ├── EnvironmentDashboard.module.css
│   │   │   ├── components/
│   │   │   │   └── TreeCard/
│   │   │   │       ├── TreeCard.tsx
│   │   │   │       └── TreeCard.module.css
│   │   │   └── TreesDashboard/
│   │   │       ├── TreesDashboard.tsx
│   │   │       └── TreesDashboard.module.css
│   │   │
│   │   ├── exploration/                   # Feature: Exploración
│   │   │   └── ExplorationDashboard.tsx
│   │   │
│   │   └── village/                       # Feature: Aldea y población
│   │       ├── VillageDashBoard.tsx
│   │       ├── VillageDashBoard.module.css
│   │       │
│   │       ├── AdministrationDashboard/   # Sub-feature: Administración
│   │       │   ├── AdministrationDashboard.tsx
│   │       │   └── AdministrationDashboard.module.css
│   │       │
│   │       ├── BuildingsDashboard/        # Sub-feature: Construcción
│   │       │   ├── BuildingsDashboard.tsx
│   │       │   ├── BuildingsDashboard.module.css
│   │       │   └── components/
│   │       │       └── BuildingCard/
│   │       │           ├── BuildingCard.tsx
│   │       │           └── BuildingCard.module.css
│   │       │
│   │       ├── HousingDashboard/          # Sub-feature: Viviendas
│   │       │   ├── HousingDashboard.tsx
│   │       │   ├── HousingDashboard.module.css
│   │       │   └── components/
│   │       │       ├── HouseCard/
│   │       │       │   ├── HouseCard.tsx
│   │       │       │   └── HouseCard.module.css
│   │       │       └── HouseDetail/
│   │       │           ├── HouseDetail.tsx
│   │       │           └── HouseDetail.module.css
│   │       │
│   │       ├── VillagersDashboard/        # Sub-feature: Aldeanos
│   │       │   ├── VillagersDashboard.tsx
│   │       │   ├── VillagersDashboard.module.css
│   │       │   └── components/
│   │       │       └── VillagerCard/
│   │       │           ├── VillagerCard.tsx
│   │       │           └── VillagerCard.module.css
│   │       │
│   │       └── WorkbenchDashboard/        # Sub-feature: Asignación de tareas
│   │           ├── WorkbenchDashboard.tsx
│   │           ├── WorkbenchDashboard.module.css
│   │           └── components/
│   │               ├── CompactVillagerCard/
│   │               │   ├── CompactVillagerCard.tsx
│   │               │   └── CompactVillagerCard.module.css
│   │               └── JobColumn/
│   │                   ├── JobColumn.tsx
│   │                   └── JobColumn.module.css
│   │
│   ├── hooks/                             # Custom React Hooks
│   │   └── useGlobalHotkeys.ts
│   │
│   ├── store/                             # Estado global (Zustand)
│   │   ├── gameStore.ts                   # Store principal y game loop
│   │   └── slices/                        # Módulos de estado
│   │       ├── buildingsSlice.ts          # Estado: Construcciones
│   │       ├── environmentSlice.ts        # Estado: Entorno y árboles
│   │       ├── explorationSlice.ts        # Estado: Exploración y niveles
│   │       ├── playerSlice.ts             # Estado: Jugador
│   │       ├── resourceSlice.ts           # Estado: Recursos
│   │       ├── timeSlice.ts               # Estado: Tiempo del juego
│   │       ├── villagersSlice.ts          # Estado: Aldeanos
│   │       └── villageSlice.ts            # Estado: Casas y asignaciones
│   │
│   └── utils/                             # Utilidades y helpers
│       └── imageService.ts                # Servicio para cargar imágenes
│
├── business.md                            # Documentación de lógica de negocio
├── architecture.md                        # Este archivo
├── README.md                              # Documentación del proyecto
│
├── eslint.config.js                       # Configuración de ESLint
├── tsconfig.json                          # Configuración base de TypeScript
├── tsconfig.app.json                      # Configuración TS para la app
├── tsconfig.node.json                     # Configuración TS para Node
├── vite.config.ts                         # Configuración de Vite
├── index.html                             # HTML de entrada
└── package.json                           # Dependencias y scripts
```

## Convenciones de Nomenclatura

### Archivos
- **Componentes React**: `PascalCase.tsx` (ej: `VillagerCard.tsx`)
- **Estilos CSS Modules**: `PascalCase.module.css` (ej: `VillagerCard.module.css`)
- **Stores/Slices**: `camelCase.ts` (ej: `villagersSlice.ts`)
- **Hooks**: `use*.ts` (ej: `useGlobalHotkeys.ts`)
- **Utilidades**: `camelCase.ts` (ej: `imageService.ts`)
- **Datos**: `camelCase.json` (ej: `buildings.json`)

### Carpetas
- **Features**: `kebab-case` o `PascalCase` según contexto
- **Componentes**: `PascalCase` cuando representan un componente
- **Categorías**: `lowercase` (ej: `components`, `utils`, `hooks`)

## Patrones de Organización

### 1. Feature-Based Structure
Los módulos funcionales (`features/`) están organizados por dominio de negocio:
- `exploration/` → Todo relacionado con exploración
- `environment/` → Todo relacionado con árboles y recursos naturales
- `village/` → Todo relacionado con aldea, población y construcción

### 2. Component Colocation
Cada componente tiene su archivo de estilos en la misma carpeta:
```
ComponentName/
├── ComponentName.tsx
└── ComponentName.module.css
```

### 3. Atomic Design (parcial)
```
components/
├── ui/          → Átomos (componentes básicos)
├── molecules/   → Moléculas (componentes compuestos)
└── game/        → Organismos específicos del juego
```

### 4. Slice Pattern (Zustand)
Cada slice representa un dominio del estado global:
- Un archivo = Una responsabilidad
- Exporta interface + creator
- Usado en `gameStore.ts` para componer el estado total

## Flujo de Datos

```
┌─────────────────┐
│   Components    │ → Leen estado y disparan acciones
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   gameStore.ts  │ → Store central de Zustand
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│     Slices      │ → Módulos de estado independientes
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Game Loop     │ → Procesa lógica automática
└─────────────────┘
```

## Principios Arquitectónicos

1. **Separación de Responsabilidades**
   - Componentes = Presentación
   - Slices = Lógica de negocio
   - Game Loop = Automatización

2. **Single Source of Truth**
   - Zustand como única fuente de verdad
   - No estado duplicado

3. **Unidirectional Data Flow**
   - Componentes → Acciones → State → Re-render

4. **Composition over Inheritance**
   - Componentes pequeños y reutilizables
   - Composición de slices en store

---

*Última actualización: 2025-10-06*
