# Research — SMARLIST-20 / HU-16

## R-01. Control del filtro

- **Decision**: `<select>` con "Todas" + 8 categorías.
- **Rationale**: Nueve botones no caben en móvil; el selector es accesible y reutiliza la lista de HU-15.
- **Alternatives considered**: botones como el filtro de estado (ocupan demasiado); chips con scroll horizontal (menos accesibles).

## R-02. Activar la agrupación

- **Decision**: Botón alternable "Agrupar por categoría" (`aria-pressed`), inactivo por defecto.
- **Rationale**: El criterio dice "debe poder mostrarse agrupada"; mantener la lista plana por defecto conserva el comportamiento y las pruebas de HU-01 a HU-17.
- **Alternatives considered**: agrupar siempre (cambia la vista de todas las historias anteriores).

## R-03. Conteo de pendientes por grupo

- **Decision**: Pendientes de la categoría en toda la lista.
- **Rationale**: Informa cuánto falta comprar de esa sección aunque haya filtros (como el resumen global); un conteo de visibles con el filtro "Comprados" sería siempre 0.
- **Alternatives considered**: pendientes visibles del grupo.

## R-04. Ubicación de la lógica

- **Decision**: Funciones puras en `src/utils/productFilters.js` (`groupByCategory`, `emptyMessageFor`).
- **Rationale**: Mantiene `App` simple y permite pruebas unitarias; reutiliza el diseño por predicados de HU-17.
