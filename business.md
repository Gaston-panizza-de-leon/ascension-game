# Ascension Game - Documentación de Lógica de Negocio

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Módulos del Juego](#módulos-del-juego)
4. [Sistema de Recursos](#sistema-de-recursos)
5. [Sistema de Tiempo](#sistema-de-tiempo)
6. [Sistema de Exploración](#sistema-de-exploración)
7. [Sistema de Entorno y Recursos Naturales](#sistema-de-entorno-y-recursos-naturales)
8. [Sistema de Aldeanos](#sistema-de-aldeanos)
9. [Sistema de Vivienda](#sistema-de-vivienda)
10. [Sistema de Construcción](#sistema-de-construcción)
11. [Sistema de Reproducción](#sistema-de-reproducción)
12. [Motor del Juego](#motor-del-juego)
13. [Flujos de Trabajo Principales](#flujos-de-trabajo-principales)

---

## Visión General

**Ascension Game** es un juego de simulación y gestión de asentamientos en tiempo real donde el jugador comienza solo y debe explorar, recolectar recursos, encontrar aldeanos, construir viviendas y expandir su comunidad.

### Concepto Central
El juego se basa en ciclos de progreso automático donde:
- El **jugador** y los **aldeanos** pueden realizar tareas simultáneamente
- El **tiempo avanza** continuamente (cada 10 segundos = 1 día del juego)
- Los **recursos se recolectan** progresivamente mientras se trabaja
- La **población crece** mediante exploración (encuentro de nuevos aldeanos) y reproducción natural
- La **construcción** permite expandir la capacidad del asentamiento

### Tecnologías Principales
- **React 19** + **TypeScript** + **Vite**
- **Zustand** para gestión de estado global
- **@faker-js/faker** para generación de nombres
- Arquitectura modular basada en "slices" de estado

---

## Arquitectura del Sistema

### Estructura de Estado (Zustand Store)

El juego utiliza una arquitectura de **slices** que dividen el estado global en módulos cohesivos:

```typescript
GameState = 
  ExplorationSlice      // Nivel de exploración y XP
  + ResourceSlice       // Recursos (madera, comida, piedra)
  + EnvironmentSlice    // Árboles y recursos naturales
  + VillageSlice        // Casas y asignaciones de vivienda
  + VillagersSlice      // Aldeanos y sus características
  + PlayerSlice         // Tarea actual del jugador
  + TimeSlice           // Tiempo del juego
  + BuildingsSlice      // Construcciones y progreso
```

### Principios de Diseño

1. **Separación de Responsabilidades**: Cada slice maneja un aspecto específico del juego
2. **Estado Inmutable**: Todas las actualizaciones usan spread operators para mantener inmutabilidad
3. **Lógica Centralizada**: Las reglas de negocio complejas están en los slices, no en componentes UI
4. **Game Loop Unificado**: Un único bucle de juego procesa todos los sistemas

---

## Módulos del Juego

### 1. Exploración (`ExplorationSlice`)

**Propósito**: Gestionar el sistema de niveles y progreso del jugador.

#### Estado
```typescript
{
  explorationLevel: number     // Nivel actual de exploración
  currentXp: number           // Experiencia acumulada
}
```

#### Mecánicas

**Ganancia de XP**:
- El jugador gana XP cuando él o sus aldeanos realizan exploración
- XP por segundo = 1000 × (jugador trabajando + aldeanos trabajando)
- Ejemplo: Si el jugador + 2 aldeanos exploran = 3000 XP/segundo

**Sistema de Niveles**:
```typescript
XP_requerida = 5 × (1.1 ^ (nivel - 1))
```
- Nivel 1 requiere: 5 XP
- Nivel 2 requiere: 5.5 XP
- Nivel 3 requiere: 6.05 XP
- Progresión exponencial suave

**Recompensas por Nivel**:
- **Cada 4 niveles**: Se descubre un nuevo árbol
- **Cada 10 niveles**: Se descubre un nuevo aldeano

#### Acciones
- `addXp(amount)`: Suma experiencia
- `levelUp()`: Incrementa el nivel
- `resetXp()`: Resetea XP al subir de nivel (preservando exceso)

---

### 2. Recursos (`ResourceSlice`)

**Propósito**: Gestionar los recursos del asentamiento.

#### Estado
```typescript
{
  wood: number    // Madera (inicial: 100)
  food: number    // Comida (inicial: 1000)
  stone: number   // Piedra (inicial: 0)
}
```

#### Mecánicas

**Madera**:
- Se obtiene talando árboles
- Cada ciclo completo de tala produce: **1 madera**
- Se consume al construir edificios

**Comida**:
- Se obtiene recolectando de árboles
- Cada ciclo completo de recolección produce: **2 comida**
- Se consume semanalmente por los aldeanos (5 comida/aldeano cada 7 días)
- La comida nunca baja de 0 (protección contra valores negativos)

**Piedra**:
- Reservado para futuras expansiones

#### Acciones
- `addWood(amount)`: Añade madera
- `addFood(amount)`: Añade comida
- `consumeFood(amount)`: Consume comida (mínimo 0)
- `removeWood(amount)`: Gasta madera (mínimo 0)

---

### 3. Tiempo (`TimeSlice`)

**Propósito**: Simular el paso del tiempo en el juego.

#### Constantes
```typescript
DAY_DURATION_MS = 10000      // 10 segundos = 1 día
DAYS_PER_YEAR = 48           // 48 días = 1 año del juego
```

#### Estado
```typescript
{
  currentDay: number           // Día actual del juego
  timeOfDayProgress: number    // Progreso del día actual (0-1)
}
```

#### Mecánicas

**Conversión de Tiempo**:
- 10 segundos reales = 1 día del juego
- 48 días del juego = 1 año del juego
- 1 año real ≈ 8 minutos de juego

**Eventos Vinculados al Tiempo**:
- **Cada día**: Los aldeanos envejecen 1 día
- **Cada día**: Se procesa reproducción de parejas
- **Cada 7 días**: Los aldeanos consumen comida
- **Eventos de construcción**: Medidos en días de juego

#### Lógica
```typescript
advanceTime(deltaTime) {
  progreso = timeOfDayProgress + (deltaTime / DAY_DURATION_MS)
  daysPassed = Math.floor(progreso)
  
  currentDay += daysPassed
  timeOfDayProgress = progreso % 1
  
  return daysPassed  // Para triggear eventos diarios
}
```

---

### 4. Entorno (`EnvironmentSlice`)

**Propósito**: Gestionar recursos naturales (árboles) y su interacción.

#### Estado
```typescript
interface Tree {
  id: number
  durability: number          // Durabilidad actual (8 inicial)
  maxDurability: number       // Durabilidad máxima (8)
  taskType: 'wood' | 'food' | null  // Tipo de tarea asignada
  progress: number            // Progreso del ciclo actual (0-100)
}

{
  trees: Tree[]
}
```

#### Mecánicas

**Descubrimiento de Árboles**:
- Se descubren automáticamente cada 4 niveles de exploración
- Cada árbol nuevo tiene ID único y 8 de durabilidad

**Asignación de Tareas**:
- El jugador define si un árbol se usa para **madera** o **comida**
- Un árbol solo puede tener UN trabajador a la vez (jugador O aldeano)
- Si ambos intentan trabajar el mismo árbol, el primero tiene prioridad

**Ciclos de Trabajo**:

| Tipo | Duración | Recurso | Efecto en Durabilidad |
|------|----------|---------|----------------------|
| Madera | 0.5 días | +1 madera | -1 durabilidad |
| Comida | 1 día | +2 comida | Sin efecto |

**Destrucción de Árboles**:
- Cuando durabilidad = 0 → el árbol se destruye
- **Sistema de Reasignación Inteligente**:
  1. Se identifica al trabajador antes de destruir
  2. Se busca otro árbol del mismo tipo sin ocupar
  3. Si existe: El trabajador se reasigna automáticamente
  4. Si no existe: El trabajador queda libre
  5. Finalmente se elimina el árbol del juego

**Velocidad de Progreso**:
```typescript
// Para madera (0.5 días)
progressoPorDía = 100 / 0.5 = 200% por día
progressoPorSegundo = 200% / (DAY_DURATION_MS / 1000)

// Para comida (1 día)
progressoPorDía = 100 / 1 = 100% por día
```

#### Acciones
- `discoverNewTree()`: Añade un nuevo árbol
- `setTreeTaskType(treeId, task)`: Define el uso del árbol
- `updateTreeProgress(treeId, progress)`: Actualiza progreso
- `processTreeCycle(treeId)`: Completa un ciclo (otorga recursos)

---

### 5. Aldeanos (`VillagersSlice`)

**Propósito**: Gestionar la población del asentamiento.

#### Constantes
```typescript
ADULT_AGE_IN_DAYS = 16 × 48 = 768 días       // Mayoría de edad
FERTILE_AGE_END_IN_DAYS = 40 × 48 = 1920 días  // Fin de edad fértil
REPRODUCTION_CHANCE_PER_DAY = 0.1             // 10% diario
```

#### Estado
```typescript
interface Villager {
  id: number
  name: string                 // Generado por Faker
  sex: 'male' | 'female'
  age: number                  // En días
  assignedTask: VillagerTask | null
  origin: 'found' | 'born'
  discoveryDay?: number        // Si origin = 'found'
  genealogy?: {                // Si origin = 'born'
    parentId1: number
    parentId2: number
  }
}

interface VillagerTask {
  type: 'exploration' | 'wood' | 'food' | 'construction'
  targetId?: number  // ID del árbol o construcción
}

{
  villagers: Villager[]
  lastFoodConsumptionDay: number
}
```

#### Mecánicas

**Descubrimiento de Aldeanos**:
- Ocurre cada 10 niveles de exploración
- Aldeanos encontrados:
  - Tienen 18 años de edad
  - Sexo aleatorio
  - Nombre generado por Faker (español)
  - Origin: 'found'

**Asignación de Tareas**:
- Un aldeano puede tener UNA tarea a la vez
- Tipos de tareas:
  - **exploration**: Suma XP (no requiere targetId)
  - **wood**: Tala árbol específico (requiere targetId)
  - **food**: Recolecta de árbol (requiere targetId)
  - **construction**: Ayuda a construir (no requiere targetId actualmente)

**Validaciones**:
- Un aldeano no puede trabajar un árbol ocupado por el jugador
- El jugador no puede trabajar un árbol ocupado por un aldeano

**Consumo de Comida**:
```typescript
Cada 7 días:
  - Aldeanos que comen = total - (encontrados en primeros 7 días)
  - Comida consumida = 5 × número_de_aldeanos_que_comen
```

**Envejecimiento**:
- Cada día que pasa, todos los aldeanos envejecen +1 día
- Procesado en el game loop

**Nacimiento de Niños**:
- Ver [Sistema de Reproducción](#sistema-de-reproducción)

#### Acciones
- `discoverNewVillager()`: Añade un aldeano encontrado
- `assignTaskToVillager(id, task)`: Asigna tarea
- `unassignVillagersByTask(task)`: Libera aldeanos de una tarea
- `processVillagerNeeds()`: Procesa consumo de comida
- `processAging()`: Envejece a todos los aldeanos
- `createChildVillager(genealogy)`: Crea un niño

---

### 6. Vivienda (`VillageSlice`)

**Propósito**: Gestionar casas y asignación de residentes.

#### Estado
```typescript
interface HouseInstance {
  id: number
  buildingId: 'HOUSE'       // Tipo de casa
  residentIds: number[]     // IDs de aldeanos residentes (máx 4)
}

{
  houses: HouseInstance[]
  nextHouseId: number
  housingAssignments: Record<houseId, villagerIds[]>
}
```

#### Mecánicas

**Capacidad**:
- Cada casa tiene capacidad para **4 personas**
- Capacidad total del pueblo = número_de_casas × 4

**Creación de Casas**:
- Se crean automáticamente al completar una construcción de tipo "HOUSE"
- Comienzan vacías (residentIds = [])

**Sistema de Asignación de Vivienda**:

Cuando hay aldeanos sin hogar (adultos sin asignar), se ejecuta un **algoritmo de prioridades**:

**Prioridad 1 - Pareja Ideal**:
- Busca casa con 1 persona
- Que sea adulto fértil (16-40 años)
- Del sexo opuesto
- ✅ Objetivo: Formar parejas para reproducción

**Prioridad 2 - Casa Vacía**:
- Busca cualquier casa sin ocupantes
- ✅ Objetivo: Optimizar uso de casas

**Prioridad 3 - Compañero Solitario**:
- Busca casa con 1 persona (sin requisitos)
- ✅ Objetivo: Reducir soledad

**Prioridad 4-8 - Apretujamiento**:
- Busca casas con menos de 4 personas
- Prioriza la que tenga menos gente
- ✅ Objetivo: Llenar casas progresivamente

**Actualización de Asignaciones**:
- Se ejecuta cada vez que pasa un día
- Procesa solo aldeanos sin hogar con edad ≥ 16 años
- Los niños se añaden directamente al nacer (ver reproducción)

#### Acciones
- `addConstructedHouse(data)`: Añade una nueva casa
- `assignVillagersToHouse(houseId, villagerIds)`: Asigna residentes
- `updateHousingAssignments()`: Ejecuta algoritmo de asignación

---

### 7. Construcción (`BuildingsSlice`)

**Propósito**: Gestionar proyectos de construcción.

#### Estado
```typescript
interface ActiveConstruction {
  buildingId: string
  progress: number  // 0-100
}

{
  builtBuildings: Record<buildingId, count>
  activeConstruction: ActiveConstruction | null
}
```

#### Plantillas de Edificios (`buildings.json`)

```json
{
  "id": "HOUSE",
  "name": "Casa Rudimentaria",
  "cost": { "wood": 30 },
  "baseConstructionTime": 2.5  // días
}
```

#### Mecánicas

**Inicio de Construcción**:
1. Verificar que no haya construcción activa
2. Verificar que exista la plantilla del edificio
3. Verificar y consumir recursos necesarios
4. Crear activeConstruction con progress = 0

**Progreso de Construcción**:
```typescript
trabajadores = aldeanos_asignados_a_construcción

progressoPorDía = 100 / baseConstructionTime
progressoPorFrame = (deltaTime / DAY_DURATION_MS) × progressoPorDía × trabajadores

// Ejemplo: Casa con 2 trabajadores
baseTime = 2.5 días
progressoPorDía = 100 / 2.5 = 40%
Con 2 trabajadores: 40% × 2 = 80% por día
```

**Velocidad según Trabajadores**:
- 0 trabajadores: Sin progreso
- 1 trabajador: 100% velocidad base
- 2 trabajadores: 200% velocidad
- n trabajadores: n × 100% velocidad

**Finalización**:
- Cuando progress ≥ 100:
  1. Se incrementa `builtBuildings[buildingId]`
  2. Se limpia `activeConstruction`
  3. Si es una HOUSE: Se ejecuta `addConstructedHouse()`

#### Acciones
- `startConstruction(buildingId)`: Inicia construcción
- `advanceConstruction(progress)`: Avanza progreso

---

### 8. Jugador (`PlayerSlice`)

**Propósito**: Gestionar la tarea actual del jugador.

#### Estado
```typescript
{
  playerTask: VillagerTask | null
}
```

#### Mecánicas

**Asignación de Tareas**:
- El jugador puede realizar las mismas tareas que los aldeanos
- Solo una tarea a la vez
- Si cambia de tarea, la anterior se cancela automáticamente

**Validaciones**:
- No puede trabajar un árbol ya ocupado por un aldeano
- Si intenta hacerlo, la acción se bloquea con warning

**Interacción con Game Loop**:
- Si playerTask !== null → Se activa el game loop
- El jugador cuenta como un trabajador más en los cálculos

#### Acciones
- `setPlayerTask(task)`: Asigna tarea al jugador

---

## Sistema de Reproducción

### Reglas de Reproducción

El sistema verifica **cada día** todas las casas buscando condiciones de reproducción:

#### Regla 1: Pareja Sola con Espacio
```typescript
Condiciones:
- Casa con exactamente 2 residentes
- Ambos adultos (≥ 768 días)
- Sexos opuestos
- Espacio disponible (< 4 residentes)

Probabilidad: 10% por día
```

#### Regla 2: Pareja con Un Hijo
```typescript
Condiciones:
- Casa con exactamente 3 residentes
- 2 adultos + 1 niño
- El niño debe ser hijo biológico de ambos (verificado por genealogy)
- Espacio disponible (< 4 residentes)

Probabilidad: 10% por día
```

### Proceso de Nacimiento

Cuando se cumple la probabilidad:
1. Se ejecuta `createChildVillager(genealogy)`
2. El niño se crea con:
   - Edad: 0 días
   - Sexo: Aleatorio
   - Nombre: Generado por Faker
   - Origin: 'born'
   - Genealogy: {parentId1, parentId2}
3. Se añade automáticamente a la casa de los padres
4. Se actualiza `residentIds` de la casa

### Crecimiento de Niños

- Los niños envejecen igual que los adultos (+1 día/día)
- A los 768 días (16 años) se consideran adultos
- Los adultos sin hogar activan el algoritmo de asignación

---

## Motor del Juego

### Game Loop Unificado

El corazón del juego es un bucle `requestAnimationFrame` que:

```typescript
gameLoop(timestamp):
  1. Calcular deltaTime desde último frame
  2. Procesar exploración (jugador + aldeanos)
  3. Procesar recolección de recursos (árboles)
  4. Procesar subidas de nivel
  5. Avanzar tiempo
  6. Si pasó un día:
     - Procesar consumo de comida
     - Procesar envejecimiento
     - Procesar reproducción
     - Actualizar asignaciones de vivienda
  7. Procesar progreso de construcción
  8. Programar siguiente frame
```

### Activación del Loop

```typescript
// El loop se activa automáticamente cuando:
playerTask !== null

// Se mantiene activo mientras haya alguna tarea
```

### Procesamiento de Sistemas

#### Exploración
```typescript
totalWorkers = (playerExploring ? 1 : 0) + villagersExploring.length
xpGained = (deltaTime / 1000) × 1000 × totalWorkers
```

#### Recursos (Árboles)
```typescript
Para cada árbol:
  Si tiene trabajador:
    progresoGanado = (deltaTime / DAY_DURATION_MS) × progressoPorDía
    Si progress ≥ 100:
      - Otorgar recurso
      - Reducir durabilidad (si madera)
      - Resetear progress
      - Si durabilidad = 0: Destruir y reasignar
  Si no tiene trabajador:
    progress = 0
```

#### Construcción
```typescript
Si hay activeConstruction:
  trabajadores = aldeanos con task.type = 'construction'
  Si trabajadores > 0:
    progressGained = (deltaTime / DAY_DURATION_MS) × (100 / baseTime) × trabajadores
    Si progress ≥ 100:
      - Finalizar construcción
      - Añadir edificio
      - Limpiar activeConstruction
```

### Subida de Nivel
```typescript
Si currentXp ≥ xpRequerida:
  1. Calcular XP sobrante
  2. Subir nivel
  3. Resetear XP
  4. Añadir XP sobrante
  5. Si nivel % 4 = 0: Descubrir árbol
  6. Si nivel % 10 = 0: Descubrir aldeano
```

---

## Flujos de Trabajo Principales

### Flujo 1: Inicio del Juego

```
1. Jugador inicia el juego
   - Level: 1
   - XP: 0
   - Recursos: Wood=100, Food=1000
   - Aldeanos: 0
   - Árboles: 0
   - Casas: 0

2. Jugador asigna tarea de exploración
   - playerTask = { type: 'exploration' }
   - Game loop se activa

3. Gana XP automáticamente
   - 1000 XP/segundo
   - Sube niveles progresivamente

4. Nivel 4: Descubre primer árbol
5. Nivel 10: Descubre primer aldeano
```

### Flujo 2: Recolección de Recursos

```
1. Jugador tiene al menos 1 árbol descubierto

2. Asigna tipo de tarea al árbol
   - setTreeTaskType(treeId, 'wood' o 'food')

3. Asigna trabajador (jugador o aldeano)
   - setPlayerTask({ type: 'wood', targetId: treeId })
   - O assignTaskToVillager(villagerId, { type: 'wood', targetId: treeId })

4. Progreso avanza automáticamente
   - Madera: 0.5 días por ciclo
   - Comida: 1 día por ciclo

5. Al completar ciclo:
   - Otorga recurso (+1 wood o +2 food)
   - Reduce durabilidad (solo madera)
   - Resetea progress

6. Si árbol se destruye:
   - Busca árbol alternativo del mismo tipo
   - Reasigna trabajador si existe
   - Elimina árbol del juego
```

### Flujo 3: Construcción de Casa

```
1. Jugador tiene suficiente madera (≥30)

2. Inicia construcción
   - startConstruction('HOUSE')
   - Consume 30 de madera
   - activeConstruction = { buildingId: 'HOUSE', progress: 0 }

3. Asigna aldeanos a construcción
   - assignTaskToVillager(id, { type: 'construction' })

4. Progreso avanza según trabajadores
   - 1 aldeano: 2.5 días
   - 2 aldeanos: 1.25 días
   - 3 aldeanos: 0.83 días

5. Al completar (progress ≥ 100):
   - Se crea HouseInstance nueva
   - Se añade a la lista de casas
   - activeConstruction = null

6. Próximo día:
   - updateHousingAssignments() ejecuta
   - Aldeanos adultos sin hogar se asignan
```

### Flujo 4: Crecimiento de Población

```
Método A: Por Exploración
1. Jugador/aldeanos exploran
2. Cada 10 niveles → Nuevo aldeano encontrado
   - Edad: 18 años
   - Sin hogar inicialmente
3. Próximo día → Se asigna casa automáticamente

Método B: Por Reproducción
1. Casa con pareja adulta (2 personas)
2. Cada día: 10% de probabilidad
3. Si éxito:
   - Nace niño (edad 0)
   - Se añade a la casa automáticamente
4. Niño envejece hasta 16 años (adulto)
5. Puede tener segundo hijo si:
   - Primera criatura aún vive con ellos
   - Aún hay espacio (< 4 personas)
```

### Flujo 5: Gestión de Comida

```
1. Cada 7 días del juego:
   - Se cuentan aldeanos que deben comer
   - Excluye: Aldeanos encontrados en primeros 7 días
   
2. Consumo:
   - 5 comida × número_de_aldeanos

3. Si no hay suficiente comida:
   - Se consume toda la disponible
   - Food = 0
   - (Sin penalización actualmente)

4. Reabastecimiento:
   - Asignar aldeanos a recolección (food)
   - Cada ciclo produce +2 comida
```

---

## Constantes Clave del Juego

### Tiempo
```typescript
DAY_DURATION_MS = 10000           // 10 seg reales = 1 día juego
DAYS_PER_YEAR = 48                // 48 días = 1 año juego
```

### Exploración
```typescript
XP_GAIN_PER_UNIT = 1000           // XP por segundo por trabajador
BASE_XP_REQUIRED = 5              // XP base nivel 1
XP_MULTIPLIER = 1.1               // Multiplicador por nivel
```

### Recursos
```typescript
WOOD_CYCLE_DAYS = 0.5             // Duración ciclo madera
FOOD_CYCLE_DAYS = 1               // Duración ciclo comida
WOOD_PER_CYCLE = 1                // Madera por ciclo
FOOD_PER_CYCLE = 2                // Comida por ciclo
```

### Población
```typescript
ADULT_AGE_IN_DAYS = 768           // 16 años × 48
FERTILE_AGE_END_IN_DAYS = 1920    // 40 años × 48
REPRODUCTION_CHANCE_PER_DAY = 0.1 // 10%
FOOD_PER_VILLAGER_WEEK = 5        // 5 comida/7 días
POPULATION_PER_HOUSE = 4          // 4 personas por casa
```

### Construcción
```typescript
HOUSE_WOOD_COST = 30              // Coste casa
HOUSE_BUILD_TIME = 2.5            // Días de construcción
```

---

## Diagramas de Flujo

### Ciclo de Vida de un Aldeano

```
[Nacimiento/Descubrimiento]
         ↓
   age = 0/18 años
         ↓
    [Asignación]
         ↓
    Sin hogar? → Sí → [Algoritmo Housing] → Asignado a casa
         ↓ No
    Tiene casa
         ↓
    [Puede trabajar]
         ↓
    Asignar tarea? → Sí → [Trabaja] → Produce recursos
         ↓ No
    Idle
         ↓
    [Cada día: +1 edad]
         ↓
    [Cada 7 días: -5 food]
         ↓
    Es adulto fértil? → Sí → [Reproducción] → Posible hijo
         ↓ No
    Continúa envejeciendo
```

### Ciclo de un Árbol

```
[Descubrimiento] (cada 4 niveles)
         ↓
   taskType = null
         ↓
Jugador asigna → wood o food
         ↓
Trabajador asignado?
    No → progress = 0
    Sí ↓
   [Progreso aumenta]
         ↓
progress ≥ 100?
    No → Continúa
    Sí ↓
   [Ciclo completo]
         ↓
Si wood: durability--
         ↓
durability = 0?
    No → Resetea progress
    Sí ↓
   [Destrucción]
         ↓
   [Reasignar trabajador]
         ↓
   [Eliminar árbol]
```

---

## Posibles Expansiones Futuras

### Sistemas Potenciales

1. **Sistema de Salud**
   - Aldeanos pueden enfermar
   - Edificio: Hospital
   - Recurso: Medicina

2. **Sistema de Felicidad**
   - Afecta productividad
   - Afecta reproducción
   - Influenciado por: comida, vivienda, trabajo

3. **Sistema de Educación**
   - Edificio: Escuela
   - Mejora eficiencia de trabajadores
   - Desbloquea nuevas tecnologías

4. **Sistema de Defensa**
   - Edificio: Muralla, Torre
   - Eventos: Ataques externos
   - Tarea: Guardia

5. **Más Tipos de Edificios**
   - Granero (aumenta almacenamiento)
   - Taller (permite crafteo avanzado)
   - Templo (aumenta felicidad)

6. **Sistema de Comercio**
   - Intercambiar recursos
   - Visitar otros asentamientos

7. **Tecnologías**
   - Árbol de investigación
   - Desbloquea edificios avanzados
   - Mejora eficiencia

---

## Notas Técnicas

### Persistencia de Estado

Actualmente **no hay persistencia**. Al recargar la página, todo se resetea. Para implementar:

```typescript
// Guardar
localStorage.setItem('gameState', JSON.stringify(gameState))

// Cargar
const savedState = JSON.parse(localStorage.getItem('gameState'))
```

### Performance

- El game loop corre a ~60 FPS
- Zustand optimiza re-renders con selectores
- Los cálculos son O(n) donde n = número de entidades

### Testing

Actualmente no hay tests. Para implementar:
- Unit tests para funciones de cálculo
- Integration tests para flujos completos
- E2E tests para UI

---

## Conclusión

**Ascension Game** es un simulador de asentamiento con sistemas interconectados que crean una experiencia de gestión compleja pero accesible. La arquitectura modular permite fácil expansión, y el game loop unificado mantiene todos los sistemas sincronizados.

El juego equilibra automatización (reproducción, asignación de casas) con control manual (asignación de tareas, construcción), creando un bucle de jugabilidad satisfactorio.
