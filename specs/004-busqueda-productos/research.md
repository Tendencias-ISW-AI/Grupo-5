# Research — SMARLIST-21 / HU-17

Sin incógnitas técnicas pendientes.

## R-01. Eliminación de tildes

- **Decision**: `text.normalize('NFD').replace(/\p{M}/gu, '')`.
- **Rationale**: NFD separa la letra base de su marca diacrítica y `\p{M}` elimina todas las marcas combinantes Unicode, no solo el rango U+0300–U+036F. Es nativo y no requiere dependencias.
- **Alternatives considered**: tabla manual de reemplazos (incompleta y difícil de mantener); `localeCompare` con `sensitivity: 'base'` (compara cadenas completas, no sirve para "contiene"); `Intl.Collator` (mismo problema); librerías externas (prohibidas sin autorización).

## R-02. Mayúsculas y minúsculas

- **Decision**: `toLowerCase()` después de quitar diacríticos.
- **Rationale**: Suficiente para nombres de productos en español; resultado determinista en las pruebas.
- **Alternatives considered**: `toLocaleLowerCase('es')` (mismo resultado para el español y depende del entorno).

## R-03. Tipo de coincidencia

- **Decision**: `String.prototype.includes` sobre textos normalizados.
- **Rationale**: Coincidencia parcial literal; los caracteres especiales no se interpretan y no hay riesgo de RegExp inválidas.
- **Alternatives considered**: `RegExp` construida con la entrada (requiere escapes y puede fallar); coincidencia por prefijo (menos útil para "imó" → "Limón"); búsqueda difusa (fuera de alcance).

## R-04. Ubicación del estado y extensibilidad

- **Decision**: Estado `searchQuery` en `App`, junto a `activeFilter`; filtrado derivado en cada render mediante `filterProducts(items, { status, query })`.
- **Rationale**: Mismo patrón que HU-06; no duplica la colección ni toca `useShoppingList` (SMARLIST-15). Un objeto de criterios con un predicado por criterio permite añadir `category` (SMARLIST-20) sin cambiar los existentes.
- **Alternatives considered**: integrar la búsqueda en el hook (prohibido por alcance); `useMemo` (innecesario a esta escala); `useDeferredValue` (la lista es pequeña).

## R-05. Marcado accesible

- **Decision**: Contenedor `role="search"`, `<label>` asociado, `input type="search"` y botón explícito "Limpiar búsqueda" con `disabled` cuando el campo está vacío; el mensaje vacío reutiliza el `role="status"` existente de `ShoppingList`.
- **Rationale**: Landmark de búsqueda reconocido por lectores de pantalla y un solo mensaje de estado. Sin `<form>`, para no cambiar el primer formulario del documento ni el comportamiento de Enter.
- **Alternatives considered**: depender del botón nativo de `type="search"` (no existe en todos los navegadores y no es accesible por teclado de forma uniforme).
