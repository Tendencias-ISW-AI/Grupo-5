
# HU-06 — Filtrar productos por estado

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | SMARLIST-7 |
| Historia | HU-06 Filtrar productos por estado |
| Requisito funcional | RF-06 |
| Prioridad | Media |

## 2. Historia de usuario

Como usuario, quiero filtrar los productos por su
estado de compra, para visualizar únicamente los
artículos que me interesan.

## 3. Criterios de aceptación

### CA-01. Opciones de filtrado

**Dado** que el usuario visualiza la lista,

**cuando** consulta los filtros disponibles,

**entonces** debe encontrar tres opciones:

- Todos
- Pendientes
- Comprados

El filtro seleccionado debe identificarse visualmente.

### CA-02. Filtro Todos

**Dado** que existen productos registrados,

**cuando** el usuario selecciona "Todos",

**entonces** deben mostrarse todos los productos,
independientemente de su estado.

### CA-03. Filtro Pendientes

**Dado** que existen productos con diferentes estados,

**cuando** selecciona "Pendientes",

**entonces** deben mostrarse únicamente aquellos
con purchased igual a false.

### CA-04. Filtro Comprados

**Dado** que existen productos con diferentes estados,

**cuando** selecciona "Comprados",

**entonces** deben mostrarse únicamente aquellos
con purchased igual a true.

### CA-05. Actualización inmediata

**Dado** que el usuario está visualizando la lista,

**cuando** cambia el filtro seleccionado,

**entonces** los productos visibles deben
actualizarse sin recargar la página.

El filtro también debe reflejar los cambios de estado
realizados mediante la funcionalidad HU-03.

### CA-06. Sin resultados

**Dado** que no existen productos que cumplan
el filtro seleccionado,

**cuando** el usuario consulta la lista,

**entonces** debe mostrarse un mensaje informativo.

Mensajes propuestos:

- Todos, sin productos:
  "Tu lista de compras está vacía"
- Pendientes, sin coincidencias:
  "No tienes productos pendientes"
- Comprados, sin coincidencias:
  "No tienes productos comprados"

### CA-07. Integridad de los datos

**Dado** que el usuario cambia entre filtros,

**cuando** vuelve a seleccionar "Todos",

**entonces** deben conservarse todos los productos
con sus datos y estados originales.

Filtrar no debe agregar, modificar ni eliminar
registros.

## 4. Modelo de datos

Se mantiene el modelo existente:

{
  id: string,
  name: string,
  quantity: number,
  purchased: boolean
}

No se incorporarán nuevas propiedades al producto.

## 5. Diseño técnico propuesto

Crear ShoppingFilters.jsx para representar
las opciones de filtrado.

El filtro activo puede administrarse mediante
estado local en App.jsx.

Valores internos recomendados:

- all
- pending
- purchased

La lista visible se calculará a partir de
los productos existentes y el filtro activo.

No crear una segunda colección persistente
ni duplicar el estado de los productos.

El filtro inicial será "Todos".

No incorporar localStorage para almacenar
el filtro seleccionado.

## 6. Subtareas técnicas

### ST-01. Componente ShoppingFilters

- Mostrar las tres opciones.
- Permitir seleccionar una opción.
- Resaltar el filtro activo.
- Utilizar controles accesibles.

### ST-02. Lógica de filtrado

- Obtener productos desde useShoppingList.
- Calcular los productos visibles.
- Conservar la colección original.
- Mantener el orden de registro.

### ST-03. Integración

- Conectar ShoppingFilters con App.jsx.
- Enviar los productos visibles a ShoppingList.
- Reutilizar ShoppingItem sin reconstruirlo.

### ST-04. Estado vacío

- Mostrar mensajes según el filtro.
- Conservar el mensaje original de lista vacía
  cuando el filtro es Todos.

### ST-05. Estilos

- Incorporar estilos para las opciones.
- Identificar visualmente el filtro activo.
- Mantener el diseño adaptable.

### ST-06. Pruebas

- Verificar los filtros.
- Verificar cambios de estado.
- Verificar mensajes vacíos.
- Verificar la integridad de la colección.
- Comprobar regresiones.

## 7. Casos de prueba

| ID | Escenario | Resultado esperado |
|---|---|---|
| CP-01 | Abrir aplicación | Filtro Todos activo |
| CP-02 | Visualizar filtros | Tres opciones disponibles |
| CP-03 | Seleccionar Todos | Todos los productos visibles |
| CP-04 | Seleccionar Pendientes | Solo purchased=false |
| CP-05 | Seleccionar Comprados | Solo purchased=true |
| CP-06 | Cambiar de filtro | Actualización inmediata |
| CP-07 | Pendientes sin resultados | Mensaje correspondiente |
| CP-08 | Comprados sin resultados | Mensaje correspondiente |
| CP-09 | Lista completamente vacía en Todos | Mensaje original |
| CP-10 | Cambiar filtros repetidamente | Productos intactos |
| CP-11 | Marcar producto estando filtrado | Lista refleja el nuevo estado |
| CP-12 | Desmarcar producto estando filtrado | Lista refleja el nuevo estado |
| CP-13 | Agregar producto en Pendientes | Nuevo producto visible |
| CP-14 | Agregar producto en Comprados | Nuevo pendiente no aparece |
| CP-15 | Eliminar producto filtrado | Se actualiza la lista visible |
| CP-16 | Editar producto filtrado | Se reflejan los datos editados |
| CP-17 | Varios productos con igual nombre | Filtrado correcto por estado |

## 8. Archivos involucrados

- src/components/ShoppingFilters.jsx
- src/components/ShoppingList.jsx
- src/App.jsx
- src/App.css
- tests/shoppingList.test.js

Consultar:

- src/hooks/useShoppingList.js
- src/components/ShoppingItem.jsx

Modificar estos últimos únicamente si resulta
técnicamente necesario.

## 9. Restricciones

- No implementar persistencia con localStorage.
- No desarrollar el resumen de compras.
- No modificar el modelo de datos.
- No crear una segunda colección de productos.
- No modificar operaciones existentes sin necesidad.
- No añadir dependencias innecesarias.
- No introducir backend ni autenticación.
- No crear funcionalidades fuera de HU-06.
- No realizar commits automáticamente.

## 10. Definición de terminado

La historia estará terminada cuando:

1. Existan los filtros Todos, Pendientes y Comprados.
2. Cada filtro muestre los productos correctos.
3. El filtro activo sea identificable.
4. La interfaz se actualice inmediatamente.
5. Existan mensajes para resultados vacíos.
6. Los productos originales permanezcan intactos.
7. Las funcionalidades HU-01 a HU-05 sigan funcionando.
8. Las pruebas automatizadas pasen.
9. La compilación sea correcta.
10. Los cambios estén disponibles para revisión.

## 11. Referencias

- Jira: SMARLIST-7.
- Requisito: RF-06.
- Arquitectura: docs/architecture.md.
- Instrucciones: AGENTS.md.
