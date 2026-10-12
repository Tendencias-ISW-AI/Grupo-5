# HU-01 — Agregar un producto

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | SMARLIST-1 |
| Épica | SMARLIST-2 |
| Historia | HU-01 Agregar un producto |
| Prioridad | Alta |
| Story Points | 3 |
| Estado inicial | Por hacer |

## 2. Historia de usuario

Como usuario, quiero agregar productos indicando su nombre y cantidad, para organizar los artículos que necesito comprar.

## 3. Criterios de aceptación

### CA-01. Formulario de registro

**Dado** que el usuario se encuentra en la aplicación,

**cuando** visualiza el formulario de registro,

**entonces** debe encontrar los campos de nombre y cantidad, y una opción para agregar el producto.

### CA-02. Validación del nombre

**Dado** que el usuario intenta agregar un producto,

**cuando** el nombre está vacío o contiene únicamente espacios,

**entonces** la aplicación debe mostrar un mensaje de error y no registrar el producto.

### CA-03. Validación de la cantidad

**Dado** que el usuario ingresa la cantidad de un producto,

**cuando** esta no corresponde a un número entero mayor que cero,

**entonces** la aplicación debe mostrar un mensaje de error y no registrar el producto.

### CA-04. Registro correcto

**Dado** que el usuario ha ingresado un nombre y una cantidad válidos,

**cuando** selecciona la opción de agregar,

**entonces** el producto debe aparecer en la lista de compras con estado "Pendiente".

### CA-05. Limpieza del formulario

**Dado** que el usuario ha registrado correctamente un producto,

**cuando** finaliza la operación,

**entonces** los campos del formulario deben limpiarse para permitir un nuevo registro.

## 4. Modelo de datos

Cada producto registrado debe contar con la siguiente estructura:

```javascript
{
  id: "identificador-unico",
  name: "Arroz",
  quantity: 2,
  purchased: false
}
```

**Reglas del modelo:**

- `id`: identificador único del producto.
- `name`: nombre del producto, sin espacios innecesarios al inicio o final.
- `quantity`: número entero positivo.
- `purchased`: valor booleano, inicialmente `false`.

Se permiten nombres repetidos, ya que cada registro tendrá un identificador independiente.

## 5. Subtareas técnicas

### ST-01. Crear formulario

Implementar `ShoppingForm.jsx` con los campos de nombre y cantidad y el botón para agregar productos.

### ST-02. Implementar registro

Incorporar en `useShoppingList.js` la operación `addProduct`, encargada de crear un producto válido y actualizar la colección.

### ST-03. Validar datos

Verificar que el nombre no esté vacío y que la cantidad sea un entero positivo.

### ST-04. Mostrar errores

Presentar mensajes de validación comprensibles cuando los datos no cumplan las reglas.

### ST-05. Visualizar el resultado

Utilizar `ShoppingList.jsx` y `ShoppingItem.jsx` para mostrar los productos agregados y su estado inicial.

Esta visualización será mínima, suficiente para comprobar CA-04. La funcionalidad completa de consulta corresponde a HU-02.

### ST-06. Crear pruebas

Implementar pruebas para verificar el registro, las validaciones y los criterios de aceptación.

## 6. Casos de prueba

| ID | Escenario | Resultado esperado |
|---|---|---|
| CP-01 | Nombre "Arroz", cantidad 2 | Producto registrado como pendiente |
| CP-02 | Nombre vacío | No registra y muestra error |
| CP-03 | Nombre compuesto por espacios | No registra y muestra error |
| CP-04 | Cantidad 0 | No registra y muestra error |
| CP-05 | Cantidad negativa | No registra y muestra error |
| CP-06 | Cantidad decimal | No registra y muestra error |
| CP-07 | Cantidad no numérica | No registra y muestra error |
| CP-08 | Producto registrado exitosamente | Formulario limpio |
| CP-09 | Dos productos con el mismo nombre | Ambos se registran con IDs diferentes |
| CP-10 | Nombre con espacios al inicio y final | Se registra el nombre normalizado |

## 7. Archivos involucrados

- `src/components/ShoppingForm.jsx`
- `src/components/ShoppingList.jsx`
- `src/components/ShoppingItem.jsx`
- `src/hooks/useShoppingList.js`
- `src/App.jsx`
- `tests/shoppingList.test.js`

Podrán modificarse archivos adicionales de configuración o estilos cuando sean necesarios para cumplir la historia.

## 8. Restricciones

- No implementar edición de productos.
- No implementar eliminación.
- No implementar filtros.
- No implementar resumen de compras.
- No implementar persistencia con localStorage.
- No incorporar backend.
- No agregar autenticación.
- No incorporar dependencias innecesarias.
- No realizar commits automáticamente.

Las funcionalidades no contempladas en esta historia se desarrollarán posteriormente según el backlog de Jira.

## 9. Definición de terminado

La historia estará terminada cuando:

1. Los cinco criterios de aceptación se cumplan.
2. El usuario pueda agregar productos válidos.
3. Los datos inválidos sean rechazados correctamente.
4. Los productos aparezcan con estado inicial pendiente.
5. El formulario se limpie después de cada registro exitoso.
6. Las pruebas automatizadas correspondientes pasen.
7. La aplicación compile correctamente.
8. El código respete `AGENTS.md` y `docs/architecture.md`.
9. Los cambios estén listos para revisión.

## 10. Referencias

- Jira: SMARLIST-1
- Requisitos: RF-01, RN-01, RN-02, RN-03 y RN-04.
- Arquitectura: `docs/architecture.md`.
- Instrucciones del agente: `AGENTS.md`.