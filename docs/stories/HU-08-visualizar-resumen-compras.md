
# HU-08 — Visualizar resumen de compras

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | SMARLIST-9 |
| Épica | SMARLIST-2 |
| Historia | HU-08 Visualizar resumen de compras |
| Requisito funcional | RF-08 |
| Estado inicial | En curso |

## 2. Historia de usuario

Como usuario, quiero visualizar un resumen del estado
de mi lista de compras, para conocer cuántos productos
tengo pendientes y cuántos he comprado.

## 3. Criterios de aceptación

### CA-01. Total de productos

Dado que existen productos registrados,
cuando el usuario consulta el resumen,
entonces debe visualizar el número total de productos.

El contador representa registros, no la suma
de sus cantidades.

### CA-02. Productos pendientes

Dado que existen productos pendientes,
cuando se visualiza el resumen,
entonces debe mostrarse cuántos tienen
purchased igual a false.

### CA-03. Productos comprados

Dado que existen productos comprados,
cuando se visualiza el resumen,
entonces debe mostrarse cuántos tienen
purchased igual a true.

### CA-04. Actualización automática

Dado que el usuario realiza operaciones
sobre la lista,
cuando agrega, elimina o cambia el estado
de un producto,
entonces los contadores deben actualizarse
inmediatamente y sin recargar la página.

La edición del nombre o cantidad no debe
alterar los contadores.

### CA-05. Lista vacía

Dado que no existen productos,
cuando el usuario consulta el resumen,
entonces los tres contadores deben mostrar cero.

## 4. Reglas de cálculo

Total:
- Número de registros existentes en la colección.

Pendientes:
- Registros con purchased === false.

Comprados:
- Registros con purchased === true.

Debe cumplirse siempre:

total = pendientes + comprados

Los contadores se calculan desde la colección
original, no desde los productos filtrados.

## 5. Diseño técnico propuesto

Crear el componente ShoppingSummary.jsx.

Responsabilidades:

- Mostrar total de productos.
- Mostrar cantidad de pendientes.
- Mostrar cantidad de comprados.
- Presentar etiquetas comprensibles.

Los valores se calcularán a partir del estado
existente de SmartList.

No se creará un nuevo estado independiente
para los contadores.

No se almacenarán los contadores en localStorage.

## 6. Subtareas técnicas

### ST-01. Crear ShoppingSummary

Implementar el componente de presentación
con tres indicadores.

### ST-02. Calcular contadores

Calcular los indicadores desde la colección
completa de productos.

### ST-03. Integrar en App

Incorporar el componente sin alterar
el flujo de datos existente.

### ST-04. Actualización dinámica

Verificar que los indicadores se actualicen
al agregar, eliminar, marcar o desmarcar.

### ST-05. Estilos

Agregar estilos mínimos, adaptables a móvil
y escritorio.

### ST-06. Pruebas

Incorporar las pruebas necesarias para
los cinco criterios de aceptación.

## 7. Casos de prueba

| ID | Escenario | Resultado esperado |
|---|---|---|
| CP-01 | Lista vacía | Todos los contadores en 0 |
| CP-02 | Un pendiente | Total 1, pendientes 1, comprados 0 |
| CP-03 | Un comprado | Total 1, pendientes 0, comprados 1 |
| CP-04 | Lista mixta | Conteos correctos |
| CP-05 | Agregar producto | Aumenta total y pendientes |
| CP-06 | Marcar como comprado | Disminuye pendientes y aumenta comprados |
| CP-07 | Desmarcar producto | Aumenta pendientes y disminuye comprados |
| CP-08 | Eliminar pendiente | Disminuyen total y pendientes |
| CP-09 | Eliminar comprado | Disminuyen total y comprados |
| CP-10 | Editar nombre o cantidad | Conteos sin cambios |
| CP-11 | Filtrar pendientes | Resumen conserva totales globales |
| CP-12 | Filtrar comprados | Resumen conserva totales globales |
| CP-13 | Recuperar localStorage | Conteos basados en datos recuperados |
| CP-14 | Eliminar último producto | Todos los contadores vuelven a cero |
| CP-15 | Cantidad superior a uno | Cuenta un registro, no la cantidad |

## 8. Archivos involucrados

- src/components/ShoppingSummary.jsx
- src/App.jsx
- src/App.css
- tests/shoppingList.test.js

Consultar:

- src/hooks/useShoppingList.js
- src/components/ShoppingFilters.jsx
- src/utils/shoppingListStorage.js

No modificarlos salvo necesidad justificada.

## 9. Restricciones

- No modificar el modelo de datos.
- No duplicar el estado de los productos.
- No almacenar los contadores.
- No modificar la persistencia existente.
- No agregar backend.
- No incorporar dependencias innecesarias.
- No introducir funcionalidades fuera del alcance.
- No realizar commits automáticamente.

## 10. Definición de terminado

La historia estará terminada cuando:

1. Se visualice el total de productos.
2. Se visualicen pendientes y comprados.
3. Los contadores se actualicen automáticamente.
4. La lista vacía muestre valores cero.
5. El resumen no dependa del filtro seleccionado.
6. La edición no altere los conteos.
7. La persistencia existente continúe funcionando.
8. Pasen las pruebas de HU-01 a HU-08.
9. La aplicación compile correctamente.
10. Los cambios estén listos para revisión.

## 11. Referencias

- Jira: SMARLIST-9.
- Requisito: RF-08.
- Regla de negocio: RN-08.
- Arquitectura: docs/architecture.md.
- Instrucciones: AGENTS.md.
