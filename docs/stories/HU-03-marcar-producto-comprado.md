
# HU-03 — Marcar producto como comprado

> **Contexto histórico (HU-01 a HU-08):** este documento conserva los criterios y restricciones de su entrega inicial. La persistencia vigente es API + MySQL desde [HU-14](HU-14-integracion-full-stack.md); los bloques de localStorage, modelo de cuatro campos y ausencia de backend describen aquella etapa. Consultar los [requisitos vigentes](../requirements.md) y el [registro de discrepancias](../documentation-traceability.md).

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | SMARLIST-4 |
| Épica | SMARLIST-2 |
| Historia | HU-03 Marcar producto como comprado |
| Sprint | 1 |
| Story Points | 3 |
| Estado inicial | En curso |

## 2. Historia de usuario

Como usuario, quiero marcar los productos que ya compré,
para diferenciarlos de aquellos que todavía están pendientes.

## 3. Criterios de aceptación

### CA-01. Opción para marcar productos

**Dado** que existen productos registrados,

**cuando** el usuario visualiza la lista,

**entonces** cada producto debe tener una opción
para marcarlo como comprado.

Se utilizará un checkbox accesible asociado
al producto correspondiente.

### CA-02. Actualización del estado

**Dado** que un producto está pendiente,

**cuando** el usuario lo marca como comprado,

**entonces** su estado debe cambiar de
"Pendiente" a "Comprado".

Internamente, purchased debe cambiar
de false a true.

### CA-03. Diferenciación visual

**Dado** que un producto está marcado como comprado,

**cuando** se visualiza en la lista,

**entonces** debe diferenciarse visualmente
de los productos pendientes.

Se utilizará el nombre tachado y un indicador
de estado "Comprado".

### CA-04. Desmarcar producto

**Dado** que un producto está comprado,

**cuando** el usuario desmarca el checkbox,

**entonces** su estado debe volver a "Pendiente".

Internamente, purchased debe cambiar
de true a false.

El nombre debe recuperar su presentación normal.

### CA-05. Actualización inmediata

**Dado** que el usuario cambia el estado
de un producto,

**cuando** marca o desmarca su checkbox,

**entonces** la interfaz debe actualizarse
inmediatamente sin recargar la página.

## 4. Modelo de datos

Se reutiliza el modelo existente:

```javascript
{
  id: "identificador-unico",
  name: "Arroz",
  quantity: 2,
  purchased: false
}
```

El atributo purchased representa el estado:

- false: Pendiente.
- true: Comprado.

No se necesitan propiedades adicionales.

## 5. Subtareas técnicas

### ST-01. Incorporar checkbox

Agregar un checkbox accesible en ShoppingItem.jsx.

Debe reflejar el valor de purchased
y permitir cambiarlo.

### ST-02. Actualizar el estado

Implementar la operación togglePurchased
en useShoppingList.js.

La operación debe:

- Identificar el producto mediante id.
- Invertir su valor purchased.
- Actualizar el estado de React sin mutaciones.
- Conservar nombre, cantidad e identificador.
- No alterar los demás productos.

### ST-03. Conectar componentes

Comunicar el cambio desde ShoppingItem
hasta useShoppingList mediante los componentes
correspondientes.

Mantener el flujo unidireccional de React.

### ST-04. Agregar estilos

Diferenciar visualmente los productos comprados
de los pendientes.

Utilizar el nombre tachado para productos comprados.

### ST-05. Incorporar pruebas

Crear o actualizar pruebas de marcación,
desmarcación y actualización de la interfaz.

## 6. Casos de prueba

| ID | Escenario | Resultado esperado |
|---|---|---|
| CP-01 | Producto pendiente | Checkbox desmarcado |
| CP-02 | Marcar producto | Estado cambia a Comprado |
| CP-03 | Producto comprado | Nombre tachado |
| CP-04 | Desmarcar producto | Estado vuelve a Pendiente |
| CP-05 | Desmarcar comprado | Se elimina el tachado |
| CP-06 | Cambiar un producto | Los demás permanecen iguales |
| CP-07 | Cambiar estado | Interfaz actualizada sin recargar |
| CP-08 | Varios cambios consecutivos | Estado final correcto |
| CP-09 | Producto inexistente | No modifica la lista |
| CP-10 | Cambiar estado | Conserva nombre, cantidad e id |

## 7. Archivos involucrados

Archivos principales:

- src/components/ShoppingItem.jsx
- src/components/ShoppingList.jsx
- src/hooks/useShoppingList.js
- src/App.jsx
- src/App.css
- tests/shoppingList.test.js

Reutilizar la implementación de HU-01 y HU-02.

## 8. Restricciones

- No modificar la estructura del modelo de datos.
- No implementar edición de productos.
- No implementar eliminación.
- No implementar filtros.
- No implementar resumen de compras.
- No implementar localStorage.
- No incorporar dependencias innecesarias.
- No modificar funcionalidades existentes sin necesidad.
- No realizar commits automáticamente.

## 9. Definición de terminado

La historia estará terminada cuando:

1. Cada producto tenga un checkbox funcional.
2. Los productos puedan marcarse como comprados.
3. Los comprados se diferencien visualmente.
4. Se pueda revertir el estado a pendiente.
5. Los cambios aparezcan inmediatamente.
6. Las pruebas correspondientes pasen.
7. La aplicación compile correctamente.
8. Las funcionalidades de HU-01 y HU-02
   continúen funcionando.
9. Los cambios estén listos para revisión.

## 10. Referencias

- Jira: SMARLIST-4.
- Épica: SMARLIST-2.
- Requisito funcional: RF-03.
- Reglas de negocio: RN-04, RN-06 y RN-07.
- Arquitectura: docs/architecture.md.
- Instrucciones: AGENTS.md.
