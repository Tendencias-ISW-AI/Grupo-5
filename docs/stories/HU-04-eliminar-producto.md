
# HU-04 — Eliminar un producto

> **Contexto histórico (HU-01 a HU-08):** este documento conserva los criterios y restricciones de su entrega inicial. La persistencia vigente es API + MySQL desde [HU-14](HU-14-integracion-full-stack.md); los bloques de localStorage, modelo de cuatro campos y ausencia de backend describen aquella etapa. Consultar los [requisitos vigentes](../requirements.md) y el [registro de discrepancias](../documentation-traceability.md).

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | SMARLIST-5 |
| Épica | SMARLIST-2 |
| Historia | HU-04 Eliminar un producto |
| Sprint | 1 |
| Story Points | 3 |
| Estado inicial | En curso |

## 2. Historia de usuario

Como usuario, quiero eliminar productos que ya no
necesito, para mantener actualizada y organizada
mi lista de compras.

## 3. Criterios de aceptación

### CA-01. Opción de eliminación

**Dado** que existen productos registrados,

**cuando** el usuario visualiza la lista,

**entonces** cada producto debe contar con
una opción para eliminarlo.

La opción debe identificar claramente
el producto que será eliminado.

### CA-02. Eliminación del producto

**Dado** que existe un producto en la lista,

**cuando** el usuario selecciona eliminar,

**entonces** el producto debe desaparecer
de la lista de compras.

La eliminación debe realizarse mediante
el identificador único del producto.

### CA-03. Independencia de productos

**Dado** que existen varios productos,

**cuando** el usuario elimina uno,

**entonces** los demás productos deben
permanecer sin modificaciones.

Esto incluye productos que compartan
el mismo nombre.

### CA-04. Actualización inmediata

**Dado** que el usuario elimina un producto,

**cuando** se ejecuta la eliminación,

**entonces** la lista debe actualizarse
inmediatamente sin recargar la página.

### CA-05. Lista vacía

**Dado** que solamente existe un producto,

**cuando** el usuario lo elimina,

**entonces** debe aparecer el mensaje:

"Tu lista de compras está vacía"

## 4. Modelo de datos

Se mantiene el modelo existente:

```javascript
{
  id: "identificador-unico",
  name: "Arroz",
  quantity: 2,
  purchased: false
}
```

La eliminación se realizará mediante id.

No es necesario modificar el modelo
ni incorporar atributos adicionales.

## 5. Subtareas técnicas

### ST-01. Agregar botón de eliminación

Incorporar un botón accesible en ShoppingItem.jsx.

Debe permitir identificar el producto
que se desea eliminar.

### ST-02. Implementar eliminación

Crear la operación removeProduct(id)
en useShoppingList.js.

La operación debe:

- Identificar el producto mediante su id.
- Excluir únicamente ese registro.
- Utilizar actualizaciones inmutables.
- Conservar los demás productos.
- Mantener la colección intacta si el id no existe.

### ST-03. Conectar componentes

Transmitir la operación desde App.jsx
hacia ShoppingList.jsx y ShoppingItem.jsx.

Reutilizar el flujo de propiedades y callbacks
existente.

### ST-04. Actualizar interfaz

Comprobar que la eliminación se refleje
inmediatamente.

Reutilizar el mensaje de lista vacía
implementado en HU-02.

### ST-05. Incorporar pruebas

Crear pruebas que verifiquen los criterios
de aceptación y la independencia de productos.

## 6. Casos de prueba

| ID | Escenario | Resultado esperado |
|---|---|---|
| CP-01 | Producto registrado | Tiene botón de eliminar |
| CP-02 | Eliminar producto único | Producto desaparece |
| CP-03 | Eliminar entre varios | Solo desaparece el seleccionado |
| CP-04 | Productos con nombre repetido | Solo elimina el ID seleccionado |
| CP-05 | Eliminar producto comprado | Se elimina correctamente |
| CP-06 | Eliminar producto pendiente | Se elimina correctamente |
| CP-07 | Eliminar ID inexistente | Lista sin cambios |
| CP-08 | Eliminar producto | Interfaz cambia sin recargar |
| CP-09 | Eliminar último producto | Muestra mensaje de lista vacía |
| CP-10 | Eliminar producto | No modifica objetos restantes |
| CP-11 | Eliminaciones consecutivas | Lista final correcta |

## 7. Archivos involucrados

- src/components/ShoppingItem.jsx
- src/components/ShoppingList.jsx
- src/hooks/useShoppingList.js
- src/App.jsx
- src/App.css
- tests/shoppingList.test.js

Reutilizar las funcionalidades implementadas
en HU-01, HU-02 y HU-03.

## 8. Restricciones

- No modificar el modelo de datos.
- No implementar edición de productos.
- No implementar filtros.
- No implementar resumen de compras.
- No implementar persistencia con localStorage.
- No incorporar backend.
- No agregar dependencias innecesarias.
- No modificar funcionalidades existentes
  fuera del alcance de esta historia.
- No realizar commits automáticamente.

No agregar confirmaciones adicionales
ni ventanas modales sin una necesidad
justificada y autorización previa.

## 9. Definición de terminado

La historia estará terminada cuando:

1. Cada producto tenga una opción de eliminación.
2. El producto seleccionado desaparezca de la lista.
3. Los demás productos permanezcan intactos.
4. La interfaz se actualice inmediatamente.
5. Se muestre el mensaje de lista vacía
   al eliminar el último producto.
6. Las pruebas correspondientes pasen.
7. La aplicación compile correctamente.
8. HU-01, HU-02 y HU-03 continúen funcionando.
9. Los cambios estén listos para revisión.

## 10. Referencias

- Jira: SMARLIST-5.
- Épica: SMARLIST-2.
- Requisito funcional: RF-04.
- Reglas de negocio: RN-04 y RN-07.
- Arquitectura: docs/architecture.md.
- Instrucciones: AGENTS.md.
