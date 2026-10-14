
# HU-07 — Conservar productos guardados

> **Contexto histórico (HU-01 a HU-08):** este documento conserva los criterios y restricciones de su entrega inicial. La persistencia vigente es API + MySQL desde [HU-14](HU-14-integracion-full-stack.md); los bloques de localStorage, modelo de cuatro campos y ausencia de backend describen aquella etapa. Consultar los [requisitos vigentes](../requirements.md) y el [registro de discrepancias](../documentation-traceability.md).

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | SMARLIST-8 |
| Historia | HU-07 Conservar productos guardados |
| Requisito funcional | RF-07 |
| Estado inicial | En curso |

## 2. Historia de usuario

Como usuario, quiero que los productos de mi lista
se guarden automáticamente, para conservar la
información cuando cierre o actualice la página.

## 3. Criterios de aceptación

### CA-01. Almacenamiento automático

**Dado** que el usuario realiza cambios en la lista,

**cuando** agrega, edita, elimina o cambia el estado
de un producto,

**entonces** la aplicación debe almacenar la lista
actualizada automáticamente en localStorage.

No debe requerirse un botón adicional para guardar.

### CA-02. Recuperación de información

**Dado** que existen productos guardados,

**cuando** el usuario recarga o vuelve a abrir
la aplicación en el mismo navegador y origen,

**entonces** deben recuperarse los productos
almacenados y mostrarse en la interfaz.

### CA-03. Conservación de atributos

**Dado** que existen productos almacenados,

**cuando** se recupera la lista,

**entonces** cada producto debe conservar:

- id
- name
- quantity
- purchased

No deben alterarse las cantidades, identificadores
ni estados de compra durante la recuperación.

### CA-04. Persistencia de operaciones

**Dado** que el usuario administra su lista,

**cuando** agrega, edita, elimina, marca o desmarca
productos,

**entonces** los cambios deben mantenerse
después de recargar la aplicación.

### CA-05. Inicialización sin datos

**Dado** que no existe información guardada,

**cuando** el usuario abre SmartList,

**entonces** debe visualizar una lista vacía.

Debe conservarse el mensaje:

"Tu lista de compras está vacía"

### CA-06. Manejo de datos inválidos

**Dado** que la información almacenada está dañada
o no cumple la estructura esperada,

**cuando** la aplicación intenta recuperarla,

**entonces** debe continuar funcionando sin
interrumpir la interfaz.

Debe utilizarse una lista vacía como estado
inicial seguro.

## 4. Modelo de datos

Se mantiene el modelo existente:

{
  id: string,
  name: string,
  quantity: number,
  purchased: boolean
}

Ejemplo:

```javascript
{
  id: "producto-001",
  name: "Arroz",
  quantity: 2,
  purchased: false
}
```

Los productos se almacenarán como una colección
serializada en formato JSON.

No se incorporarán propiedades adicionales.

## 5. Diseño técnico propuesto

La persistencia utilizará localStorage.

Clave recomendada:

smartlist.products

Responsabilidades propuestas:

- useShoppingList: administrar el estado de productos.
- Lectura inicial: recuperar datos válidos.
- Escritura: almacenar el estado actualizado.
- Validación: rechazar estructuras inválidas.

Se recomienda utilizar una inicialización diferida
de useState para recuperar los datos almacenados
sin realizar lecturas innecesarias en cada render.

La persistencia no debe almacenar:

- Estado temporal de formularios.
- Errores de validación.
- Filtro seleccionado.
- Borradores de edición sin guardar.

## 6. Subtareas técnicas

### ST-01. Recuperación inicial

- Consultar localStorage al inicializar el hook.
- Convertir la información JSON a objetos.
- Validar la estructura recuperada.
- Inicializar una lista vacía cuando corresponda.

### ST-02. Guardado automático

- Observar los cambios en la colección.
- Serializar los productos mediante JSON.
- Guardar la colección actualizada.
- No requerir interacción adicional.

### ST-03. Validación de información

Comprobar:

- Que la información sea un arreglo.
- Que cada producto tenga un ID válido.
- Que el nombre sea válido.
- Que la cantidad sea un entero positivo.
- Que purchased sea booleano.
- Que los identificadores sean únicos.

Si la colección almacenada no es válida,
se utilizará una lista vacía.

### ST-04. Manejo de errores

Gestionar errores previsibles de:

- Lectura de localStorage.
- Conversión de JSON.
- Acceso restringido al almacenamiento.
- Escritura por falta de espacio o permisos.

La aplicación debe continuar funcionando
en memoria cuando no sea posible almacenar datos.

### ST-05. Integración

Conservar las operaciones existentes:

- addProduct
- updateProduct
- removeProduct
- togglePurchased

Evitar modificar sus contratos públicos si no
es necesario.

### ST-06. Pruebas

Incorporar pruebas de almacenamiento, recuperación,
integridad de datos y regresión.

## 7. Casos de prueba

| ID | Escenario | Resultado esperado |
|---|---|---|
| CP-01 | Agregar producto | Se guarda automáticamente |
| CP-02 | Recargar página | Recupera productos |
| CP-03 | Producto comprado | Conserva purchased=true |
| CP-04 | Producto pendiente | Conserva purchased=false |
| CP-05 | Editar producto | Persisten nombre y cantidad |
| CP-06 | Eliminar producto | No reaparece al recargar |
| CP-07 | Marcar o desmarcar | Persiste el último estado |
| CP-08 | Sin datos guardados | Lista vacía |
| CP-09 | JSON malformado | Aplicación sigue funcionando |
| CP-10 | Estructura incorrecta | Lista vacía segura |
| CP-11 | IDs duplicados | Datos rechazados |
| CP-12 | Datos incompletos | Datos rechazados |
| CP-13 | localStorage inaccesible | Aplicación funciona en memoria |
| CP-14 | Error de escritura | Aplicación no se bloquea |
| CP-15 | Varios productos válidos | Conserva datos y orden |
| CP-16 | Cambiar filtro | No altera datos almacenados |
| CP-17 | Cancelar edición | No guarda el borrador |
| CP-18 | Lista vaciada | Persiste la eliminación total |
| CP-19 | Recarga posterior | No sobrescribe datos válidos con una lista vacía |

## 8. Archivos involucrados

Principales:

- src/hooks/useShoppingList.js
- tests/shoppingList.test.js

Según necesidades técnicas, puede crearse
un módulo pequeño dedicado a la persistencia
o sus validaciones.

Documentación:

- README.md
- docs/architecture.md

No modificar componentes visuales
si no resulta necesario.

## 9. Restricciones

- No incorporar backend.
- No utilizar bases de datos externas.
- No implementar autenticación.
- No incorporar sincronización entre dispositivos.
- No modificar el modelo de producto.
- No guardar formularios ni filtros.
- No implementar el resumen de compras.
- No agregar dependencias innecesarias.
- No modificar funcionalidades anteriores
  fuera del alcance de HU-07.
- No realizar commits automáticamente.

## 10. Definición de terminado

La historia estará terminada cuando:

1. Los productos se guarden automáticamente.
2. Los datos se recuperen al recargar.
3. Se conserven todos los atributos.
4. Las operaciones existentes persistan.
5. El sistema inicie vacío sin datos guardados.
6. Se gestionen datos inválidos sin bloquear la app.
7. Se manejen fallos de almacenamiento.
8. Pasen las pruebas de HU-07 y anteriores.
9. La aplicación compile correctamente.
10. Los cambios estén listos para revisión.

## 11. Referencias

- Jira: SMARLIST-8.
- Requisito: RF-07.
- Arquitectura: docs/architecture.md.
- Requisitos: docs/requirements.md.
- Instrucciones: AGENTS.md.
