# Especificación de requisitos — SmartList

## 1. Introducción

SmartList es una aplicación web educativa orientada a la gestión de listas de compras personales. Permite organizar productos, consultar su estado de compra y conservarlos en MySQL mediante una API REST y una interfaz React.

Este documento define los requisitos funcionales, no funcionales y las reglas de negocio que orientarán el desarrollo incremental de la aplicación.

Actualización documental: 2026-10-14, tarea [SMARLIST-25](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-25). Se contrastaron Jira, las especificaciones y el código de esta rama. RF-01 a RF-08 conservan su identidad; RF-07 cambia su mecanismo de persistencia por HU-14. Las equivalencias de numeración y conflictos se registran en [Discrepancias y procedencia](documentation-traceability.md). Los RF expresan comportamiento requerido; su presencia no certifica que todos los criterios estén satisfechos por este checkout.

## 2. Alcance del sistema

SmartList permitirá gestionar una única lista de compras personal desde un navegador web.

El usuario puede registrar, consultar, editar, eliminar y marcar productos, asignarles categorías, filtrar por estado y categoría, agruparlos, buscar por nombre y consultar un resumen global. React consume la API de Node.js/Express; MySQL conserva los productos y sus cambios al recargar o reiniciar el servidor, mientras no se eliminen los datos persistidos.

La aplicación no incluye autenticación, pagos, integraciones con supermercados ni sincronización automática entre clientes. El backend propio forma parte del sistema. La etapa inicial de persistencia en localStorage es histórica: HU-14 la sustituye sin importación automática de los productos antiguos.

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

El sistema debe conservar los productos registrados y sus cambios en MySQL, accediendo mediante la API.

Condiciones:

- Guardar registro, edición, eliminación y estado mediante operaciones confirmadas por la API.
- Recuperar los datos al cargar nuevamente la aplicación.
- Conservar nombre, cantidad, identificador, estado y, desde HU-15, categoría.
- Guardar los cambios de las operaciones sobre la lista.
- Mostrar una lista vacía solo cuando GET confirme que no existen productos.
- Distinguir los errores de carga de una lista vacía y no presentar una escritura rechazada como guardada.
- No leer, importar, sobrescribir ni borrar automáticamente los productos históricos de localStorage.

**Historias relacionadas:** HU-07 (objetivo de conservación, implementación inicial histórica), HU-10 y HU-14 (persistencia vigente). Detalle en RF-09 y RF-14.

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

### RF-09. Consultar productos y conservarlos en MySQL

El sistema debe consultar los productos persistidos mediante una API conectada a MySQL.

Condiciones:

- Exponer `GET /api/products` y devolver HTTP 200 con un arreglo JSON directo de todos los productos; sin registros, devolver `[]`.
- Conservar identidades, nombres repetidos y valores almacenados, sin modificar datos ni crear el esquema al consultar.
- Devolver `id`, `name`, `quantity` y `purchased` booleano; HU-15 añade `category` al contrato vigente.
- Recuperar los mismos datos después de cerrar conexiones o reiniciar el proceso servidor, sin eliminar la base.
- Distinguir una consulta fallida de una lista vacía: indisponibilidad conocida devuelve 503 y los errores inesperados 500, sin credenciales, SQL ni trazas.
- Preparar el esquema con `npm run db:init`, compatible con MySQL 8.0.16 o superior, sin borrar productos ni alterar estructuras incompatibles.

**Historias relacionadas:** HU-10 / SMARLIST-11; complementa RF-07.

### RF-10. Registrar productos mediante la API

El sistema debe permitir registrar productos en MySQL mediante la API, validando sus datos y generando su identidad en el servidor.

Condiciones:

- Exponer `POST /api/products` con nombre y cantidad; `category` es opcional desde HU-15.
- Normalizar el nombre con trim; exigir texto válido no vacío de hasta 150 caracteres Unicode y cantidad numérica entera entre 1 y 2147483647, sin convertir strings.
- Generar el UUID en el backend y establecer `purchased=false`; no aceptar identidad o estado inicial enviados por el cliente.
- Persistir en MySQL antes de responder 201 con el producto creado; permitir registros con nombres repetidos e IDs distintos.
- Responder 400 a entradas inválidas sin insertar; mantener errores de almacenamiento controlados.

**Historias relacionadas:** HU-11 / SMARLIST-12; complementa RF-01.

### RF-11. Editar productos mediante PUT

El sistema debe permitir modificar los datos de un producto persistido, conservando su identidad y estado de compra.

Condiciones:

- Exponer `PUT /api/products/:id` con nombre y cantidad completos y válidos; categoría opcional según RF-15.
- Modificar exclusivamente el producto indicado, conservando identificador y estado de compra.
- Devolver 200 con los datos confirmados incluso si los valores no cambian; un identificador válido inexistente devuelve 404 sin crear registros.
- Rechazar solicitudes inválidas con 400 antes de modificar datos; conservar la edición en MySQL tras consultas o reinicios.

**Historias relacionadas:** HU-12 según la especificación local; HU-14 / SMARLIST-15, criterio 3. Asociación a SMARLIST-13 pendiente de reconciliación (D-02).

### RF-12. Persistir el cambio de estado mediante PATCH

El sistema debe permitir guardar y revertir el estado de compra de un producto mediante la API.

Condiciones:

- Exponer `PATCH /api/products/:id/status` y aceptar exclusivamente `{ purchased: boolean }`.
- Permitir marcar y desmarcar, manteniendo identificador, nombre, cantidad y categoría.
- Persistir el nuevo estado en MySQL y devolver 200 con el producto confirmado, también si el estado ya coincide.
- Responder 400 ante UUID o estado inválido y 404 si el producto no existe, sin modificar otros registros.

**Historias relacionadas:** HU-12, descripción actual de SMARLIST-13 (en conflicto con su título y spec); HU-14 / SMARLIST-15, criterio 4.

### RF-13. Eliminar productos mediante la API

El sistema debe permitir eliminar de forma persistente un producto identificado sin afectar los demás.

Condiciones:

- Exponer `DELETE /api/products/:id` para eliminar físicamente solo el producto con ese UUID, esté pendiente o comprado.
- Responder 204 sin cuerpo ni JSON tras confirmar la eliminación; mantener intactos los demás productos.
- Responder 400 a un UUID inválido y 404 a un UUID válido inexistente, también en un segundo intento.
- No recuperar el producto eliminado en futuras consultas o después de reiniciar el servidor.

**Historias relacionadas:** HU-13 / SMARLIST-14; complementa RF-04.

### RF-14. Integrar React con la API y MySQL

La interfaz React debe gestionar la lista mediante la API y representar los datos confirmados por MySQL.

Condiciones:

- Cargar la lista inicial desde GET y gestionar registro, edición, cambio de estado y eliminación mediante POST, PUT, PATCH y DELETE respectivamente.
- Reflejar únicamente los resultados confirmados por la API; el servidor genera los identificadores.
- Mostrar estados diferenciados de carga, error y lista vacía; conservar datos confirmados y borradores cuando una escritura falla.
- Conservar filtros y resumen global calculados sobre una única colección de productos confirmados, sin perder las funcionalidades previas.
- Recuperar productos de MySQL al recargar o reabrir; no leer, migrar, sobrescribir ni borrar automáticamente los datos históricos de localStorage.
- Mantener filtros, texto de búsqueda, agrupación, resumen y borradores como estado de interfaz sin persistirlos.

**Historias relacionadas:** HU-14 / SMARLIST-15; actualiza RF-07.

### RF-15. Gestionar categorías de productos

El sistema debe permitir asignar, cambiar y mostrar una categoría válida para cada producto.

Condiciones:

- Incluir `category` en la tabla products y en las respuestas de productos de GET, POST, PUT y PATCH.
- Usar el conjunto fijo: Frutas y verduras, Carnes y pescados, Lácteos, Panadería, Despensa, Bebidas, Aseo y Otros.
- Aceptar categoría opcional en POST y PUT: omitirla en POST asigna Otros; omitirla en PUT conserva la categoría almacenada.
- Rechazar categorías fuera de la lista, de tipo incorrecto o con escritura distinta con 400 sin modificar registros.
- Migrar productos anteriores sin categoría a Otros mediante db:init, de forma idempotente y sin pérdida de datos.
- Ofrecer un selector al registrar y editar, precargado con Otros o la categoría actual, y mostrar la categoría confirmada de cada producto.
- Mantener la misma lista de categorías en cliente y servidor, con pruebas que comprueben su correspondencia.

**Historias relacionadas:** HU-15 / SMARLIST-19 y su continuación de interfaz SMARLIST-22.

### RF-16. Filtrar por categoría

El sistema debe permitir seleccionar productos por categoría junto a los criterios de estado y búsqueda.

Condiciones:

- Mostrar el selector Categoría con Todas y una opción por categoría válida; iniciar en Todas.
- Combinar categoría, estado y búsqueda: un producto debe cumplir todos los criterios activos para ser visible.
- Mostrar un mensaje informativo sin coincidencias y conservar el resumen global sobre toda la lista.
- Conservar los datos y el orden relativo recibido; el filtrado no escribe en la API ni se persiste al recargar.

**Historias relacionadas:** HU-16 / SMARLIST-20; complementa RF-06.

### RF-17. Agrupar por categoría

El sistema debe ofrecer una vista opcional de los productos organizada por categorías, con sus pendientes.

Condiciones:

- Ofrecer el control alternable Agrupar por categoría, inactivo por defecto, para pasar entre lista plana y grupos.
- Mostrar un encabezado por categoría con productos visibles, en el orden fijo de categorías; no mostrar grupos vacíos.
- Indicar en cada grupo el número de productos pendientes de esa categoría en toda la lista, sin aplicar los filtros al contador.
- Conservar dentro de cada grupo el orden de los productos recibidos; recalcular grupos y contadores al modificar la lista.
- Mantener el resumen global y no persistir el modo de agrupación.

**Historias relacionadas:** HU-16 / SMARLIST-20.

### RF-18. Buscar productos por nombre

El sistema debe permitir localizar productos por coincidencias parciales de su nombre mientras se escribe.

Condiciones:

- Mostrar un campo de búsqueda visible sobre la lista y actualizar resultados mientras se escribe, sin enviar un formulario ni recargar.
- Buscar coincidencias parciales literales en el nombre, sin distinguir mayúsculas, minúsculas ni diacríticos; normalizar espacios.
- Combinar la búsqueda con los filtros de estado y categoría, sin modificar los productos ni consultar un endpoint adicional.
- Tratar una búsqueda vacía o de espacios como ausencia de búsqueda; ofrecer Limpiar búsqueda y devolver el foco al campo.
- Mostrar un mensaje claro sin coincidencias; si la colección completa está vacía, mantener Tu lista de compras está vacía.
- Conservar el resumen global y reiniciar la búsqueda al recargar.

**Historias relacionadas:** HU-17 / SMARLIST-21; combinación con categoría completada en HU-16.


HU-09 / SMARLIST-10 concreta la mejora visual y adaptable mediante RNF-01 y RNF-02; no se crea un RF duplicado para esa mejora. El número RF no se deriva automáticamente del número HU: RF-09 corresponde a la consulta de HU-10.

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

### RNF-06. Conservación persistente

Los productos confirmados deben conservarse en MySQL independientemente del proceso servidor o del almacenamiento del navegador. La recuperación depende de la disponibilidad de la API, de MySQL y de que la base persistida no sea eliminada.

Los productos antiguos guardados solo en localStorage pertenecen a la etapa histórica y no se importan ni recuperan automáticamente en la aplicación conectada. No se incluyen garantías de copia de seguridad o sincronización entre clientes.

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

**RN-09. Persistencia mediante API y MySQL**

MySQL es la fuente persistente de productos y el cliente representa los datos confirmados por la API. No debe usarse localStorage como fuente alternativa si una solicitud falla. La conservación local de HU-07 permanece solo como referencia histórica.

**RN-10. Productos repetidos**

Se permite registrar varios productos con el mismo nombre. Cada registro será independiente y tendrá su propio identificador.

## 6. Restricciones técnicas

- La interfaz utiliza React y Vite; el backend existente usa Node.js y Express con ES Modules.
- Se utilizará JavaScript y CSS.
- Los productos se almacenan en MySQL mediante mysql2/promise, sin ORM. La preparación actual está limitada a smartlist_db local en MySQL 8.0.16 o superior.
- El backend mantiene Routes → Controllers → Services → Repositories → MySQL y SQL parametrizado para entradas externas.
- Las variables y credenciales de conexión permanecen fuera del frontend y del control de versiones.
- El esquema se prepara explícitamente con db:init, no durante solicitudes o importaciones.
- localStorage no es persistencia activa ni alternativa ante errores; no hay migración automática de datos históricos.
- No se implementará autenticación.
- No se incorporan servicios externos de negocio; la API propia está dentro del alcance.
- No introducir TypeScript, nuevas dependencias, entidades o cambios de contrato sin una tarea autorizada.
- El desarrollo seguirá las historias de usuario priorizadas en Jira.

## 7. Matriz de trazabilidad

| Requisito | Historia de usuario | Jira verificado | Especificaciones | Historia documental |
|---|---|---|---|---|
| RF-01 | HU-01 | [SMARLIST-1](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-1) | Pendiente de verificar (A) | [HU-01](stories/HU-01-agregar-producto.md) |
| RF-02 | HU-02 | [SMARLIST-3](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-3) | Pendiente de verificar (A) | [HU-02](stories/HU-02-visualizar-productos.md) |
| RF-03 | HU-03 | [SMARLIST-4](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-4) | Pendiente de verificar (A) | [HU-03](stories/HU-03-marcar-producto-comprado.md) |
| RF-04 | HU-04 | [SMARLIST-5](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-5) | Pendiente de verificar (A) | [HU-04](stories/HU-04-eliminar-producto.md) |
| RF-05 | HU-05 | [SMARLIST-6](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-6) | Pendiente de verificar (A) | [HU-05](stories/HU-05-editar-producto.md) |
| RF-06 | HU-06 | [SMARLIST-7](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-7) | Pendiente de verificar (A) | [HU-06](stories/HU-06-filtrar-productos.md) |
| RF-07 | HU-07; HU-10 y HU-14 para persistencia vigente | [SMARLIST-8](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-8); [SMARLIST-11](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-11); [SMARLIST-15](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-15) | [001-consultar-productos](../specs/001-consultar-productos/spec.md); [005-integracion-full-stack](../specs/005-integracion-full-stack/spec.md) | [HU-07](stories/HU-07-conservar-productos.md) |
| RF-08 | HU-08 | [SMARLIST-9](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-9) | Pendiente de verificar (A) | [HU-08](stories/HU-08-visualizar-resumen-compras.md) |
| RNF-01 y RNF-02 | HU-09: mejora visual | [SMARLIST-10](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-10) | Pendiente de verificar (B) | [HU-09](stories/HU-09-mejorar-interfaz-responsive.md) |
| RF-09 | HU-10 | [SMARLIST-11](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-11) | [001-consultar-productos](../specs/001-consultar-productos/spec.md) | [HU-10](stories/HU-10-consultar-productos.md) |
| RF-10 | HU-11 | [SMARLIST-12](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-12) | [002-registro-productos](../specs/002-registro-productos/spec.md) | [HU-11](stories/HU-11-registrar-productos.md) |
| RF-11 | HU-12 local (D-02); HU-14, criterio 3 | [SMARLIST-13](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-13); [SMARLIST-15](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-15) | [003-edicion-productos](../specs/003-edicion-productos/spec.md); [005-integracion-full-stack](../specs/005-integracion-full-stack/spec.md) | [HU-12](stories/HU-12-editar-productos.md) |
| RF-12 | HU-12 descripción Jira (D-02); HU-14, criterio 4 | [SMARLIST-13](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-13); [SMARLIST-15](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-15) | [005-integracion-full-stack](../specs/005-integracion-full-stack/spec.md) | [HU-12](stories/HU-12-editar-productos.md) |
| RF-13 | HU-13 | [SMARLIST-14](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-14) | [004-eliminacion-productos](../specs/004-eliminacion-productos/spec.md) | [HU-13](stories/HU-13-eliminar-productos-mysql.md) |
| RF-14 | HU-14 | [SMARLIST-15](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-15) | [005-integracion-full-stack](../specs/005-integracion-full-stack/spec.md) | [HU-14](stories/HU-14-integracion-full-stack.md) |
| RF-15 | HU-15 | [SMARLIST-19](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-19); [SMARLIST-22](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-22) | [006-categorias-productos](../specs/006-categorias-productos/spec.md); [007-categorias-interfaz](../specs/007-categorias-interfaz/spec.md) | [HU-15](stories/HU-15-categorias-productos.md) |
| RF-16 | HU-16 | [SMARLIST-20](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-20) | [008-filtrar-agrupar-categoria](../specs/008-filtrar-agrupar-categoria/spec.md) | [HU-16](stories/HU-16-filtrar-agrupar-categoria.md) |
| RF-17 | HU-16 | [SMARLIST-20](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-20) | [008-filtrar-agrupar-categoria](../specs/008-filtrar-agrupar-categoria/spec.md) | [HU-16](stories/HU-16-filtrar-agrupar-categoria.md) |
| RF-18 | HU-17 | [SMARLIST-21](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-21); [SMARLIST-20](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-20) | [004-busqueda-productos](../specs/004-busqueda-productos/spec.md); [008-filtrar-agrupar-categoria](../specs/008-filtrar-agrupar-categoria/spec.md) | [HU-17](stories/HU-17-buscar-productos.md) |

(A) No se encontró una especificación SDD dedicada a HU-01 a HU-08. Sus criterios se conservan en los archivos históricos de docs/stories; **pendiente de verificar** si existe otro artefacto fuera del repositorio. RF-07 enlaza las especificaciones que sustituyen su mecanismo de persistencia.

(B) No se encontró un artefacto en specs para la mejora visual HU-09. Su título, objetivo y criterios proceden de SMARLIST-10; **pendiente de verificar** la existencia de una especificación dedicada.

D-02: la atribución de edición PUT a HU-12 no está reconciliada con la descripción actual de Jira. RF-11 se apoya en la especificación local y en HU-14; RF-12 recoge PATCH según Jira y la integración. Véase el [registro de discrepancias](documentation-traceability.md).

Las rutas de specs se conservan sin renumerar; sus FR son identificadores locales a cada especificación, distintos de los RF globales de este documento. Esta matriz no certifica sprints, aprobación funcional ni merge de otras ramas.

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

Tampoco forman parte de esta actualización documental la importación de datos antiguos de localStorage, la retirada de su utilidad histórica, el despliegue, cambios de infraestructura o nuevas funcionalidades. La persistencia MySQL y la API propia sí están dentro del alcance vigente.

El uso de inteligencia artificial se concentra en el proceso de desarrollo mediante Codex.
