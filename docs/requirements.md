# Especificación de requisitos — SmartList

## 1. Introducción

SmartList es una aplicación web educativa orientada a la gestión de listas de compras personales. Su propósito es permitir que los usuarios organicen sus productos, consulten su estado de compra y conserven la información en el navegador.

Este documento define los requisitos funcionales, no funcionales y las reglas de negocio que orientarán el desarrollo incremental de la aplicación.

## 2. Alcance del sistema

SmartList permitirá gestionar una única lista de compras personal desde un navegador web.

El usuario podrá registrar productos, visualizarlos, modificar su información, eliminarlos y cambiar su estado entre pendiente y comprado. También podrá filtrar los productos, consultar un resumen de la lista y conservar los datos localmente.

La aplicación no incluirá autenticación, pagos, servicios externos ni sincronización entre dispositivos.

## 3. Requisitos funcionales

### RF-01. Registrar productos

El sistema debe permitir agregar productos a la lista mediante un formulario que solicite nombre y cantidad.

Condiciones:

- El nombre del producto es obligatorio.
- La cantidad debe ser un número entero positivo.
- Los productos registrados deben iniciar con estado "Pendiente".
- El sistema debe mostrar mensajes cuando los datos no sean válidos.
- Al registrar correctamente un producto, el formulario debe limpiarse.

**Historia relacionada:** HU-01.

### RF-02. Visualizar productos

El sistema debe mostrar los productos registrados en la lista de compras.

Condiciones:

- Mostrar nombre, cantidad y estado.
- Reflejar los cambios sin recargar la página.
- Mostrar un mensaje informativo cuando la lista esté vacía.

**Historia relacionada:** HU-02.

### RF-03. Actualizar estado de compra

El sistema debe permitir cambiar el estado de cada producto entre "Pendiente" y "Comprado".

Condiciones:

- Cada producto debe disponer de un control para cambiar su estado.
- Los productos comprados deben diferenciarse visualmente.
- Debe ser posible revertir el estado de comprado a pendiente.
- Los cambios deben reflejarse inmediatamente.

**Historia relacionada:** HU-03.

### RF-04. Eliminar productos

El sistema debe permitir eliminar productos registrados.

Condiciones:

- Cada producto debe disponer de una opción de eliminación.
- La eliminación debe afectar únicamente al producto seleccionado.
- La lista debe actualizarse inmediatamente.
- Si se elimina el último producto, debe mostrarse el estado de lista vacía.

**Historia relacionada:** HU-04.

### RF-05. Editar productos

El sistema debe permitir modificar el nombre y la cantidad de un producto existente.

Condiciones:

- Mostrar los valores actuales al iniciar la edición.
- Aplicar las mismas validaciones del registro.
- Permitir guardar o cancelar los cambios.
- Mantener el estado de compra del producto durante la edición.

**Historia relacionada:** HU-05.

### RF-06. Filtrar productos

El sistema debe permitir visualizar los productos según su estado.

Filtros:

- Todos.
- Pendientes.
- Comprados.

Condiciones:

- El filtro debe aplicarse inmediatamente.
- El filtro activo debe poder identificarse visualmente.
- Si no existen resultados, debe mostrarse un mensaje informativo.
- El filtrado no debe modificar los productos almacenados.

**Historia relacionada:** HU-06.

### RF-07. Persistencia de datos

El sistema debe conservar los productos registrados mediante almacenamiento local del navegador.

Condiciones:

- Guardar los productos en localStorage.
- Recuperar los datos al cargar nuevamente la aplicación.
- Conservar el nombre, cantidad, identificador y estado.
- Guardar los cambios de las operaciones sobre la lista.
- Inicializar una lista vacía cuando no existan datos.
- Gestionar datos almacenados inválidos sin bloquear la aplicación.

**Historia relacionada:** HU-07.

### RF-08. Resumen de compras

El sistema debe mostrar información resumida sobre la lista.

Indicadores:

- Total de productos registrados.
- Número de productos pendientes.
- Número de productos comprados.

Condiciones:

- Los contadores deben actualizarse al cambiar la lista.
- Cuando no existan productos, los contadores deben mostrar cero.
- Los valores representan registros de productos, no la suma de sus cantidades.

**Historia relacionada:** HU-08.

## 4. Requisitos no funcionales

### RNF-01. Usabilidad

La interfaz debe ser sencilla y comprensible, con controles identificables y mensajes claros para el usuario.

### RNF-02. Diseño adaptable

La aplicación debe permitir utilizar sus funcionalidades principales tanto en dispositivos móviles como en computadores de escritorio.

### RNF-03. Compatibilidad

La aplicación debe funcionar en versiones modernas de navegadores basados en Chromium y Firefox que sean compatibles con las tecnologías utilizadas.

### RNF-04. Confiabilidad

El sistema debe validar entradas incorrectas y gestionar los errores previsibles sin interrumpir la interfaz.

### RNF-05. Mantenibilidad

El código debe organizarse en componentes y funciones con responsabilidades definidas, siguiendo la arquitectura documentada.

### RNF-06. Almacenamiento local

Los datos deben conservarse en el navegador utilizado, mientras el almacenamiento local permanezca disponible y no sea eliminado.

El sistema no garantiza la recuperación de información si el usuario borra los datos del navegador.

### RNF-07. Pruebas

Las funcionalidades implementadas deben disponer de pruebas apropiadas para verificar la lógica y sus criterios de aceptación.

## 5. Reglas de negocio

**RN-01. Nombre obligatorio**

No se permite registrar o guardar un producto cuyo nombre esté vacío o contenga únicamente espacios.

**RN-02. Cantidad válida**

La cantidad debe ser un número entero mayor que cero.

**RN-03. Estado inicial**

Todos los productos nuevos se registran inicialmente como pendientes.

**RN-04. Identificador único**

Cada producto debe tener un identificador único que permita realizar operaciones sobre él sin afectar otros registros.

**RN-05. Edición del estado**

Modificar el nombre o la cantidad no debe alterar el estado de compra del producto.

**RN-06. Cambio reversible**

El usuario puede cambiar el estado de un producto entre pendiente y comprado tantas veces como lo necesite.

**RN-07. Independencia de productos**

Editar, eliminar o cambiar el estado de un producto no debe modificar los demás.

**RN-08. Cálculo de indicadores**

El total de productos corresponde al número de registros existentes. Los contadores de pendientes y comprados deben sumar ese total.

**RN-09. Persistencia local**

La información debe asociarse al almacenamiento local del navegador, sin sincronización externa.

**RN-10. Productos repetidos**

Se permite registrar varios productos con el mismo nombre. Cada registro será independiente y tendrá su propio identificador.

## 6. Restricciones técnicas

- El sistema será una aplicación frontend desarrollada con React y Vite.
- Se utilizará JavaScript y CSS.
- El almacenamiento de datos se realizará con localStorage.
- No se implementará backend.
- No se utilizará una base de datos remota.
- No se implementará autenticación.
- No se incorporarán integraciones externas.
- El desarrollo seguirá las historias de usuario priorizadas en Jira.

## 7. Matriz de trazabilidad

| Requisito | Historia de usuario | Sprint |
|---|---|---|
| RF-01 | HU-01: Agregar productos | 1 |
| RF-02 | HU-02: Visualizar productos | 1 |
| RF-03 | HU-03: Marcar como comprado | 1 |
| RF-04 | HU-04: Eliminar productos | 1 |
| RF-05 | HU-05: Editar productos | 2 |
| RF-06 | HU-06: Filtrar productos | 2 |
| RF-07 | HU-07: Guardar y recuperar productos | 2 |
| RF-08 | HU-08: Resumen de compras | 2 |

## 8. Criterios generales de validación

Una funcionalidad se considerará aceptada cuando:

1. Cumpla los criterios de aceptación de su historia de usuario.
2. Respete las reglas de negocio aplicables.
3. No afecte negativamente funcionalidades existentes.
4. Supere las pruebas correspondientes.
5. Pueda ejecutarse correctamente en la aplicación.

## 9. Funcionalidades fuera de alcance

No se contempla implementar:

- Registro o inicio de sesión.
- Listas compartidas entre usuarios.
- Sincronización en la nube.
- Pagos o compras por internet.
- Integración con supermercados.
- Notificaciones externas.
- Gestión de múltiples listas independientes.
- Inteligencia artificial dentro de la aplicación.

El uso de inteligencia artificial se concentra en el proceso de desarrollo mediante Codex.