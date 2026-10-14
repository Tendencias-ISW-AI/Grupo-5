
# HU-02 — Visualizar lista de productos

> **Contexto histórico (HU-01 a HU-08):** este documento conserva los criterios y restricciones de su entrega inicial. La persistencia vigente es API + MySQL desde [HU-14](HU-14-integracion-full-stack.md); los bloques de localStorage, modelo de cuatro campos y ausencia de backend describen aquella etapa. Consultar los [requisitos vigentes](../requirements.md) y el [registro de discrepancias](../documentation-traceability.md).

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | SMARLIST-3 |
| Épica | SMARLIST-2 |
| Historia | HU-02 Visualizar lista de productos |
| Sprint | 1 |
| Story Points | 3 |
| Estado inicial | En curso |

## 2. Historia de usuario

Como usuario, quiero visualizar los productos que he
registrado, para consultar los artículos que necesito
comprar.

## 3. Criterios de aceptación

### CA-01. Visualización de productos

**Dado** que existen productos registrados,

**cuando** el usuario consulta la lista de compras,

**entonces** debe visualizar todos los productos
registrados.

Los productos deben presentarse de manera organizada
y comprensible.

### CA-02. Información de cada producto

**Dado** que existen productos en la lista,

**cuando** se visualiza un producto,

**entonces** deben mostrarse:

- Nombre del producto.
- Cantidad registrada.
- Estado de compra.

El estado debe representarse claramente como
"Pendiente" o "Comprado", según corresponda.

### CA-03. Actualización inmediata

**Dado** que el usuario se encuentra visualizando
la lista de compras,

**cuando** registra un nuevo producto válido,

**entonces** este debe aparecer inmediatamente,
sin necesidad de recargar la página.

### CA-04. Lista vacía

**Dado** que no existen productos registrados,

**cuando** el usuario accede a la lista,

**entonces** debe mostrarse el mensaje:

"Tu lista de compras está vacía".

El mensaje debe desaparecer cuando se registre
el primer producto.

## 4. Modelo de datos

Se reutilizará el modelo definido en HU-01:

```javascript
{
  id: "identificador-unico",
  name: "Arroz",
  quantity: 2,
  purchased: false
}
```

La visualización utilizará los atributos:

- name: nombre del producto.
- quantity: cantidad registrada.
- purchased: estado de compra.

El atributo id se utilizará como identificador
estable de cada elemento en React.

No modificar el modelo de datos sin justificación.

## 5. Subtareas técnicas

### ST-01. Revisar componentes existentes

Inspeccionar ShoppingList.jsx y ShoppingItem.jsx,
implementados parcialmente durante HU-01.

Identificar qué criterios ya cumplen y cuáles
requieren ajustes.

Reutilizar las implementaciones existentes.

### ST-02. Completar ShoppingList.jsx

Asegurar que el componente:

- Reciba la colección de productos.
- Muestre todos los elementos.
- Utilice identificadores estables en React.
- Presente un mensaje cuando la lista esté vacía.

### ST-03. Completar ShoppingItem.jsx

Asegurar que cada producto muestre:

- Nombre.
- Cantidad.
- Estado de compra.

La información debe resultar clara para el usuario.

### ST-04. Verificar actualización de React

Comprobar que los productos agregados mediante
ShoppingForm se reflejen inmediatamente en la lista.

Reutilizar el estado administrado por
useShoppingList.js.

### ST-05. Verificar la presentación

Revisar los estilos existentes y realizar únicamente
los ajustes necesarios para una visualización clara
en escritorio y dispositivos móviles.

### ST-06. Incorporar pruebas

Crear o actualizar las pruebas automatizadas
que verifiquen los criterios de aceptación.

## 6. Casos de prueba

| ID | Escenario | Resultado esperado |
|---|---|---|
| CP-01 | Lista sin productos | Mensaje de lista vacía |
| CP-02 | Lista con un producto | Producto visible |
| CP-03 | Lista con varios productos | Todos aparecen |
| CP-04 | Producto con nombre y cantidad | Ambos datos visibles |
| CP-05 | Producto pendiente | Muestra "Pendiente" |
| CP-06 | Producto comprado proporcionado al componente | Muestra "Comprado" |
| CP-07 | Agregar un producto válido | Aparece sin recargar |
| CP-08 | Agregar el primer producto | Desaparece mensaje de lista vacía |
| CP-09 | Productos con nombres repetidos | Ambos aparecen como registros independientes |

El caso CP-06 verifica únicamente la representación
de un estado recibido por el componente.

No implica implementar el cambio de estado,
que corresponde a HU-03.

## 7. Archivos involucrados

Archivos principales:

- src/components/ShoppingList.jsx
- src/components/ShoppingItem.jsx
- src/App.jsx
- src/App.css
- tests/shoppingList.test.js

Consultar también:

- src/components/ShoppingForm.jsx
- src/hooks/useShoppingList.js

Estos últimos deben modificarse solamente si resulta
necesario para cumplir los criterios de aceptación.

## 8. Restricciones

- No reconstruir funcionalidades completas de HU-01.
- No modificar la lógica de registro sin necesidad.
- No implementar botones para marcar productos.
- No implementar edición ni eliminación.
- No implementar filtros.
- No implementar resumen de compras.
- No implementar localStorage.
- No incorporar backend ni dependencias innecesarias.
- No realizar commits automáticamente.

El estado "Comprado" podrá mostrarse cuando el
componente reciba ese valor, sin incorporar todavía
controles para modificarlo.

## 9. Definición de terminado

La historia estará terminada cuando:

1. Se visualicen todos los productos registrados.
2. Cada producto muestre nombre, cantidad y estado.
3. Los productos nuevos aparezcan inmediatamente.
4. Se muestre el mensaje cuando la lista esté vacía.
5. Las pruebas relacionadas se ejecuten correctamente.
6. La aplicación compile sin errores.
7. Se mantenga la funcionalidad de HU-01.
8. La implementación respete AGENTS.md y
   docs/architecture.md.
9. Los cambios estén disponibles para revisión.

## 10. Referencias

- Jira: SMARLIST-3.
- Épica: SMARLIST-2.
- Requisito funcional: RF-02.
- Historia relacionada: HU-01.
- Arquitectura: docs/architecture.md.
- Instrucciones: AGENTS.md.
