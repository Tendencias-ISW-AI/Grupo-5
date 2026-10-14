
# HU-05 — Editar un producto

> **Contexto histórico (HU-01 a HU-08):** este documento conserva los criterios y restricciones de su entrega inicial. La persistencia vigente es API + MySQL desde [HU-14](HU-14-integracion-full-stack.md); los bloques de localStorage, modelo de cuatro campos y ausencia de backend describen aquella etapa. Consultar los [requisitos vigentes](../requirements.md) y el [registro de discrepancias](../documentation-traceability.md).

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | SMARLIST-6 |
| Épica | SMARLIST-2 |
| Historia | HU-05 Editar un producto |
| Estado inicial | En curso |
| Requisito funcional | RF-05 |

## 2. Historia de usuario

Como usuario, quiero modificar el nombre o la cantidad
de un producto, para corregir errores o actualizar
la información de mi lista.

## 3. Criterios de aceptación

### CA-01. Opción de edición

**Dado** que existen productos registrados,

**cuando** el usuario visualiza la lista,

**entonces** cada producto debe contar con una
opción que permita editarlo.

La opción debe identificar el producto
correspondiente de manera accesible.

### CA-02. Mostrar los valores actuales

**Dado** que el usuario selecciona editar,

**cuando** se activa el modo de edición,

**entonces** deben mostrarse el nombre y la
cantidad actuales del producto.

### CA-03. Modificar los datos

**Dado** que el producto está en modo de edición,

**cuando** el usuario modifica el nombre o la cantidad,

**entonces** debe poder guardar los nuevos valores.

Los cambios deben aplicarse únicamente al producto
seleccionado mediante su identificador único.

### CA-04. Aplicar validaciones

**Dado** que el usuario intenta guardar una edición,

**cuando** los datos ingresados son inválidos,

**entonces** la aplicación debe mostrar mensajes
de error y no guardar los cambios.

Se aplicarán las mismas reglas de HU-01:

- Nombre obligatorio.
- Nombre no compuesto únicamente por espacios.
- Cantidad obligatoria.
- Cantidad entera mayor que cero.
- Rechazo de cantidades negativas y decimales.
- Rechazo de valores no numéricos.
- Normalización de espacios exteriores del nombre.

### CA-05. Guardar o cancelar

**Dado** que el usuario está editando un producto,

**cuando** selecciona Guardar,

**entonces** los cambios válidos deben actualizar
el producto y finalizar el modo de edición.

**Cuando** selecciona Cancelar,

**entonces** debe salir del modo de edición sin
modificar la información original.

### CA-06. Conservar estado de compra

**Dado** que existe un producto pendiente o comprado,

**cuando** el usuario modifica y guarda su nombre
o cantidad,

**entonces** debe conservar su estado original
de compra.

La edición tampoco debe modificar su identificador.

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

Campos editables:

- name
- quantity

Campos que deben conservarse:

- id
- purchased

No incorporar nuevas propiedades al modelo.

## 5. Subtareas técnicas

### ST-01. Incorporar modo de edición

Agregar una opción de edición en ShoppingItem.jsx.

Al activarla, deben visualizarse los valores
actuales del producto.

Se recomienda reutilizar los patrones visuales
y las validaciones del formulario existente.

### ST-02. Implementar actualización

Crear updateProduct(id, data) en useShoppingList.js.

La operación debe:

- Buscar el producto mediante id.
- Validar el nuevo nombre y cantidad.
- Actualizar únicamente el producto seleccionado.
- Conservar id y purchased.
- Mantener los demás productos sin modificaciones.
- Utilizar actualizaciones inmutables.
- No modificar la lista si el ID no existe.
- No modificar datos cuando la validación falle.

### ST-03. Guardar y cancelar

Implementar las acciones:

- Guardar: confirmar una edición válida.
- Cancelar: descartar los cambios no guardados.

La cancelación no debe modificar el estado
de ningún producto.

### ST-04. Conectar componentes

Transmitir los callbacks necesarios desde App.jsx
hacia ShoppingList.jsx y ShoppingItem.jsx.

Conservar las operaciones existentes de registro,
marcación y eliminación.

### ST-05. Estilos

Incorporar únicamente los estilos necesarios
para los campos y botones de edición.

Mantener la interfaz adaptable a pantallas móviles.

### ST-06. Pruebas

Implementar pruebas automatizadas para
todos los criterios de aceptación.

## 6. Casos de prueba

| ID | Escenario | Resultado esperado |
|---|---|---|
| CP-01 | Producto registrado | Muestra opción Editar |
| CP-02 | Iniciar edición | Precarga nombre y cantidad |
| CP-03 | Editar nombre | Guarda el nuevo nombre |
| CP-04 | Editar cantidad | Guarda la nueva cantidad |
| CP-05 | Nombre vacío | Rechaza cambios |
| CP-06 | Nombre con espacios | Rechaza cambios |
| CP-07 | Cantidad cero | Rechaza cambios |
| CP-08 | Cantidad negativa | Rechaza cambios |
| CP-09 | Cantidad decimal o no numérica | Rechaza cambios |
| CP-10 | Guardar edición válida | Sale del modo de edición |
| CP-11 | Cancelar edición | Conserva datos originales |
| CP-12 | Editar producto comprado | Conserva purchased=true |
| CP-13 | Editar producto pendiente | Conserva purchased=false |
| CP-14 | Editar entre varios productos | No modifica los demás |
| CP-15 | Editar entre nombres repetidos | Solo actualiza el ID elegido |
| CP-16 | ID inexistente | No modifica la lista |
| CP-17 | Editar producto | Conserva identificador |
| CP-18 | Nombre con espacios exteriores | Guarda nombre normalizado |
| CP-19 | Editar producto | Interfaz se actualiza sin recargar |

## 7. Archivos involucrados

Archivos principales:

- src/components/ShoppingItem.jsx
- src/components/ShoppingList.jsx
- src/hooks/useShoppingList.js
- src/App.jsx
- src/App.css
- tests/shoppingList.test.js

Consultar también:

- src/components/ShoppingForm.jsx
- docs/requirements.md
- docs/architecture.md

No modificar el formulario de registro
innecesariamente.

## 8. Restricciones

- No modificar la estructura del modelo de datos.
- No implementar persistencia con localStorage.
- No implementar filtros.
- No implementar resumen de compras.
- No incorporar backend.
- No agregar dependencias sin autorización.
- No modificar funcionalidades anteriores
  fuera del alcance necesario.
- No crear abstracciones innecesarias.
- No realizar commits automáticamente.

## 9. Definición de terminado

La historia estará terminada cuando:

1. Cada producto tenga una opción de edición.
2. Se visualicen sus datos actuales.
3. Se puedan modificar nombre y cantidad.
4. Se apliquen las validaciones de HU-01.
5. Se pueda guardar o cancelar.
6. Se conserve el identificador y estado de compra.
7. Se actualice la interfaz inmediatamente.
8. Las pruebas correspondientes pasen.
9. La aplicación compile correctamente.
10. Las historias HU-01 a HU-04 sigan funcionando.
11. Los cambios estén disponibles para revisión.

## 10. Referencias

- Jira: SMARLIST-6.
- Épica: SMARLIST-2.
- Requisito funcional: RF-05.
- Reglas de negocio: RN-01, RN-02, RN-04,
  RN-05 y RN-07.
- Arquitectura: docs/architecture.md.
- Instrucciones: AGENTS.md.
