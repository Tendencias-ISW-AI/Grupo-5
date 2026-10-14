# SmartList — Lista de compras

SmartList es una aplicación web que permite organizar y gestionar listas de compras de manera sencilla. Los usuarios pueden registrar productos, indicar cuáles han comprado y consultar los artículos que tienen pendientes.

El proyecto se desarrolla como parte de una actividad académica enfocada en el uso de agentes de inteligencia artificial para asistir el proceso de desarrollo de software.

## Objetivo del proyecto

Desarrollar una aplicación web funcional utilizando React, aplicando buenas prácticas de desarrollo, control de versiones con Git y GitHub, gestión de historias de usuario en Jira y programación asistida por inteligencia artificial mediante Codex.

## Funcionalidades

La aplicación contempla las siguientes funcionalidades:

- Agregar productos indicando nombre y cantidad.
- Visualizar los productos registrados.
- Marcar productos como comprados o pendientes.
- Eliminar productos.
- Editar la información de los productos.
- Filtrar productos según su estado.
- Buscar productos por nombre, sin distinguir mayúsculas ni tildes.
- Conservar la lista mediante MySQL y la API REST.
- Consultar un resumen de productos comprados y pendientes.

Las funcionalidades se implementarán progresivamente de acuerdo con las historias de usuario definidas en Jira.

## Tecnologías utilizadas

| Tecnología | Propósito |
|---|---|
| React | Construcción de la interfaz de usuario |
| Vite | Entorno de desarrollo y compilación |
| JavaScript | Implementación de la lógica de la aplicación |
| CSS | Estilos y diseño adaptable |
| Node.js + Express | API REST por capas |
| MySQL | Persistencia de productos |
| Vitest | Pruebas automatizadas |
| Git y GitHub | Control de versiones y repositorio |
| Jira | Gestión de historias de usuario |
| Codex | Asistencia de inteligencia artificial para el desarrollo |

## Arquitectura

SmartList utiliza una arquitectura frontend basada en componentes de React, organizada por responsabilidades técnicas.

La interfaz se divide en componentes reutilizables y la lógica de estado se administra mediante hooks personalizados.

Desde HU-14, React consulta y modifica productos mediante Express y MySQL. Se mantienen componentes y un único estado de productos confirmados por el servidor.

La descripción técnica se encuentra en `docs/architecture.md`.

## Estructura del proyecto

```text
smartlist/
├── AGENTS.md
├── README.md
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   └── stories/
├── src/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── tests/
├── backend/
└── specs/
```

La estructura puede incluir otros archivos necesarios para la configuración y ejecución del proyecto.

## Requisitos previos

Para ejecutar SmartList localmente es necesario contar con:

- Node.js en una versión LTS compatible con Vite.
- npm.
- Git.
- Un editor de código, como Visual Studio Code.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/Tendencias-ISW-AI/Grupo-5-SmartList.git
```

### 2. Acceder al directorio

```bash
cd Grupo-5-SmartList
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Iniciar el servidor de desarrollo

Preparar primero MySQL y arrancar el backend como se explica más abajo. API predeterminada: `http://localhost:3000/api`. Para cambiarla, copiar `.env.example` a `.env` y ajustar solo `VITE_API_BASE_URL`. No incluir secretos en Vite. Mantener `FRONTEND_ORIGIN=http://localhost:5173` en backend.

```bash
npm run dev
```

Abrir en el navegador la dirección local indicada por Vite.

#### Verificación manual de HU-01

1. Confirmar que inicialmente aparece el mensaje de lista vacía.
2. Registrar `  Arroz  ` con cantidad `2`: debe aparecer `Arroz`, cantidad `2` y estado `Pendiente`, y ambos campos deben limpiarse.
3. Intentar registrar un nombre vacío o con espacios y cantidades vacías, `0`, `-1`, `1.5` o `abc`: deben aparecer errores, conservarse los campos y mantenerse la lista sin nuevos registros.
4. Corregir los datos y registrar nuevamente `Arroz`: deben verse dos registros independientes.
5. Revisar la interfaz en una ventana estrecha y usar Tab y Enter para recorrer y enviar el formulario.
6. Recargar la página: los productos deben recuperarse con sus datos y estados.

#### Verificación manual de HU-03

1. Agregar varios productos, incluidos dos con el mismo nombre. Sus checkboxes deben comenzar desmarcados.
2. Marcar un checkbox: solo ese registro debe mostrar "Comprado" y su nombre tachado inmediatamente.
3. Desmarcarlo: debe volver a "Pendiente" y recuperar el nombre sin tachado.
4. Usar Tab para enfocar el checkbox y Espacio para marcar y desmarcar. Comprobar también la interacción con ratón y una ventana móvil.
5. Alternar varias veces: nombre, cantidad y registros restantes deben conservarse. Al recargar, se recupera la última lista guardada.

#### Verificación manual de HU-04

1. Agregar varios productos, incluidos dos con el mismo nombre, y marcar uno como comprado.
2. Pulsar Eliminar en un registro: debe desaparecer inmediatamente sin modificar los demás nombres, cantidades o estados.
3. Eliminar registros pendientes y comprados; al eliminar el último debe aparecer exactamente "Tu lista de compras está vacía".
4. Agregar nuevamente un producto y marcarlo para comprobar que las funcionalidades anteriores siguen disponibles.
5. Revisar el botón en escritorio y una ventana móvil; usar Tab y Enter para eliminar con teclado.

#### Verificación manual de HU-05

1. Agregar dos productos con el mismo nombre y marcar uno como comprado.
2. Pulsar Editar: deben aparecer el nombre y la cantidad actuales, junto con Guardar y Cancelar.
3. Modificar ambos campos y guardar: solo ese registro debe cambiar, conservando su estado de compra y tachado cuando corresponda.
4. Intentar guardar nombre vacío o con espacios, y cantidades vacías, cero, negativas, decimales o texto: deben mostrarse errores y conservarse las entradas.
5. Cancelar y reabrir: deben recuperarse los datos guardados y desaparecer los errores anteriores.
6. Usar Tab para recorrer los campos y botones, y Enter para guardar. Revisar escritorio y una ventana móvil sin desbordamiento horizontal.
7. Agregar, marcar y eliminar después de editar para comprobar las funcionalidades anteriores.

#### Verificación manual de HU-06

1. Registrar productos y marcar alguno como comprado. Todos debe estar activo inicialmente.
2. Seleccionar Pendientes y Comprados: solo deben mostrarse los registros correspondientes, conservando el orden. Usar Tab y Enter o Espacio para seleccionar por teclado.
3. Marcar en Pendientes o desmarcar en Comprados: el producto debe desaparecer de esa vista y permanecer en Todos.
4. Registrar un producto en Comprados: no aparecerá en esa vista porque inicia pendiente; debe estar disponible en Todos y Pendientes.
5. Editar y eliminar un producto visible, comprobando que los registros ocultos no cambien.
6. Sin coincidencias deben aparecer los mensajes del filtro; si no queda ningún producto, debe mostrarse "Tu lista de compras está vacía" en cualquier filtro.
7. Cambiar a un filtro que oculta un producto en edición descarta su borrador sin guardar. Revisar también una ventana móvil sin desbordamiento horizontal.

#### Verificación manual de HU-17 (SMARLIST-21)

1. Registrar "Limón", "Leche", "Lechuga" y "Arroz". El campo "Buscar producto" aparece sobre los filtros y la lista, y "Limpiar búsqueda" está deshabilitado.
2. Escribir `l`, `le`, `lec`: la lista se reduce en cada pulsación. `limon`, `LIMÓN` o `  limón  ` encuentran "Limón".
3. Marcar "Lechuga", buscar `lech` y alternar filtros: Todos muestra ambos, Pendientes solo "Leche" y Comprados solo "Lechuga".
4. Buscar `xyz`: aparece `No se encontraron productos que coincidan con "xyz"` y el resumen sigue representando toda la lista.
5. Pulsar "Limpiar búsqueda": el campo queda vacío y con foco, y reaparecen los productos del filtro activo. Al recargar, la búsqueda vuelve a estar vacía.

#### Verificación manual de HU-07

1. Agregar productos, editar nombre y cantidad, marcar o desmarcar y recargar: los atributos deben conservarse.
2. Cerrar y reabrir la aplicación en el mismo navegador y origen: debe recuperarse la lista.
3. Eliminar un producto y recargar: no debe reaparecer. Eliminar todos y recargar: debe mantenerse la lista vacía.
4. Cambiar filtros o cancelar un borrador: no debe alterarse lo guardado. Al recargar, el filtro vuelve a Todos.

#### Almacenamiento y errores

HU-14 sustituye la persistencia activa de HU-07 por MySQL. Los datos históricos de `smartlist.products` se conservan sin leerlos, migrarlos, sobrescribirlos ni borrarlos automáticamente: no aparecerán en la lista conectada. `shoppingListStorage.js` permanece solo para comprobar el formato histórico en pruebas aisladas; la aplicación no lo importa.

La interfaz diferencia carga, error y lista vacía. Solo muestra cambios confirmados; un fallo conserva productos y formulario. Las escrituras se serializan y los controles se bloquean mientras se confirman. Tras una carga fallida, solucionar conexión y recargar. Sin reintentos automáticos, modo sin conexión, autenticación ni sincronización en tiempo real entre clientes. Filtros, contadores y borradores no se persisten.

#### Verificación manual de HU-08

1. Con la lista vacía, comprobar Total de productos, Pendientes y Comprados en cero.
2. Agregar un producto con cantidad mayor que uno: cuenta un registro, no la suma de cantidades.
3. Marcar y desmarcar: debe trasladarse entre pendientes y comprados sin cambiar el total.
4. Editar nombre y cantidad: los contadores no deben cambiar. Eliminar pendientes y comprados: debe disminuir el total y el indicador correspondiente.
5. Cambiar entre filtros: el resumen siempre representa toda la lista, incluso si no hay resultados visibles.
6. Recargar: el resumen debe calcularse desde los productos recuperados. Al eliminar el último, los tres indicadores deben volver a cero.
7. Revisar escritorio y móvil, comprobando etiquetas legibles y ausencia de desbordamiento horizontal.

### 5. Ejecutar las pruebas

```bash
npm test
```

Vitest está configurado con jsdom para probar el estado y las interacciones de React. `npm test` ejecuta las pruebas una vez; `npm run test:watch` las ejecuta en modo interactivo.

### 6. Generar la versión de producción

```bash
npm run build
```

## Organización del desarrollo

El trabajo se organiza en historias de usuario registradas en Jira y distribuidas en dos sprints:

**Sprint 1 — Funcionalidades principales**

- HU-01: Agregar productos.
- HU-02: Visualizar productos.
- HU-03: Marcar productos como comprados.
- HU-04: Eliminar productos.

**Sprint 2 — Mejoras y persistencia**

- HU-05: Editar productos.
- HU-06: Filtrar productos por estado.
- HU-07: Guardar y recuperar productos.
- HU-08: Visualizar resumen de compras.

**Ampliaciones posteriores**

- HU-17 (SMARLIST-21): Buscar productos por nombre.

Cada historia cuenta con criterios de aceptación que permiten verificar su cumplimiento.

## Desarrollo asistido por IA

Codex se utiliza como agente de programación para apoyar el análisis, implementación y validación de las historias de usuario.

El repositorio incluye el archivo `AGENTS.md`, que establece las instrucciones generales que debe seguir el agente.

Las especificaciones funcionales y técnicas se encuentran en el directorio `docs/`.

El código generado por IA debe ser revisado y validado por los desarrolladores antes de incorporarse a la rama principal.

## Documentación

- `AGENTS.md`: instrucciones de trabajo para Codex.
- `docs/requirements.md`: requisitos funcionales y no funcionales.
- `docs/architecture.md`: estructura y decisiones arquitectónicas.
- `docs/stories/`: especificaciones de historias de usuario.

## Estado del proyecto

**En desarrollo académico.**

HU-01 permite agregar productos con nombre y cantidad y validar los datos. HU-02 muestra todos los registros con su nombre, cantidad y estado recibido (Pendiente o Comprado), y el mensaje "Tu lista de compras está vacía" cuando no hay productos. HU-03 permite marcar y desmarcar cada producto mediante un checkbox accesible; los comprados muestran su nombre tachado. HU-04 permite eliminar cada producto mediante su botón, conservando los demás registros. Al eliminar el último, aparece el mensaje de lista vacía. HU-05 permite editar nombre y cantidad, validar, guardar o cancelar sin alterar el identificador ni el estado de compra. HU-06 permite filtrar por Todos, Pendientes y Comprados, con indicador del filtro activo y mensajes sin resultados. Los filtros conservan los datos y el orden de registro. Todas estas operaciones actualizan la interfaz inmediatamente. HU-07 introdujo persistencia local, sustituida por MySQL en la integración HU-14; se conserva la recuperación tras recargar o reabrir. HU-08 muestra el total global de registros, pendientes y comprados, con actualización automática y sin depender del filtro. Las ocho historias del alcance inicial están implementadas; la revisión final del proyecto sigue correspondiendo al equipo. HU-17 (SMARLIST-21) agrega una búsqueda por nombre que filtra mientras se escribe, sin distinguir mayúsculas ni tildes, combinada con el filtro de estado, con mensaje sin coincidencias y opción para limpiar. La búsqueda es estado de la interfaz: no se envía a la API ni se conserva al recargar. Artefactos SDD: `specs/004-busqueda-productos/`.

Las funcionalidades se incorporan progresivamente mediante historias de usuario y control de versiones en GitHub.

## Alcance

SmartList es una aplicación educativa. No contempla autenticación, colaboración entre usuarios, compras en línea, pagos ni integración con servicios externos.

La información se almacena localmente en el navegador y origen utilizados, sin sincronización entre dispositivos. Si el almacenamiento no está disponible, la aplicación continúa en memoria.

## Integración continua (CI)

SMARLIST-24 incorpora `.github/workflows/ci.yml`. Cada Pull Request dirigido a `main` ejecuta CI al abrirse, reabrirse o recibir nuevos commits, independientemente del nombre de su rama de origen. Utiliza runners Ubuntu, Node.js 22 y tres jobs independientes:

| Check | Directorio | Comandos |
|---|---|---|
| `CI - Frontend` | Raíz | `npm ci`, `npm test`, `npm run build` |
| `CI - Backend` | `backend/` | `npm ci`, `npm test` |
| `CI - MySQL` | `backend/` | `npm ci`, `npm run db:init`, `npm run test:mysql` |

La caché de npm utiliza el archivo de lock de cada proyecto; las dependencias se instalan siempre con `npm ci`. El token de GitHub tiene únicamente `contents: read` y checkout no conserva sus credenciales. No se necesitan secretos de GitHub ni credenciales del entorno de desarrollo.

En el Pull Request, abrir **Checks** o **Details** junto al check para ver el job, el paso y sus logs. También se puede consultar la pestaña **Actions**, workflow **CI**. Un comando que termina con error hace fallar su job y el workflow; los pasos posteriores de ese job no se ejecutan. Los otros jobs independientes pueden terminar para mostrar sus resultados. No hay `continue-on-error` ni comandos que ignoren fallos.

Para ejecutar las mismas validaciones localmente, utilizar Node.js 22 y, desde la raíz:

```sh
npm ci
npm test
npm run build
cd backend
npm ci
npm test
```

### MySQL en CI y en desarrollo

`npm test` omite por defecto las suites que requieren una base real. El job `CI - MySQL` las activa explícitamente mediante `npm run test:mysql`; utiliza un servicio desechable `mysql:8.0` y un health check antes de inicializar el esquema. Las variables son `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME=smartlist_db`, `DB_USER=root` y una contraseña pública exclusiva del contenedor de prueba. Esta cuenta puede crear el esquema y aplicar sus restricciones; el servicio se elimina al terminar el job. Nunca reutilizar estas credenciales fuera de CI.

Para probar localmente, disponer de MySQL 8.0.16 o superior en localhost:3306 y configurar `backend/.env` siguiendo `backend/.env.example`, con credenciales propias y `DB_NAME=smartlist_db`. Desde `backend/`:

```sh
npm run db:init
npm run test:mysql
```

Usar una base local de desarrollo, nunca producción. Las suites crean y limpian sus propios fixtures y se ejecutan secuencialmente según `vitest.mysql.config.js`. Incluyen pruebas HTTP y reinicio de procesos de la API; no es necesario iniciar Express manualmente.

### Exigir los checks para fusionar a main

Crear el workflow **no activa automáticamente la protección de rama**. Un administrador del repositorio de destino debe:

1. Ejecutar CI en un Pull Request hacia `main` para que GitHub registre los tres checks. Los PR de un fork o de un colaborador nuevo pueden necesitar aprobación de un mantenedor para ejecutar Actions.
2. En **Settings → Branches**, crear o editar una regla de protección para `main` (o utilizar **Settings → Rules → Rulesets** con destino `main`).
3. Activar **Require a pull request before merging** y **Require status checks to pass before merging**.
4. Seleccionar `CI - Frontend`, `CI - Backend` y `CI - MySQL`, preferiblemente con GitHub Actions como fuente. Si se exige una rama actualizada, activar **Require branches to be up to date before merging**.
5. Guardar la regla y configurar que los permisos de omisión no permitan eludir estas validaciones, según la política del equipo.

La regla debe configurarse en el repositorio donde se fusionará el PR; proteger un fork no protege el repositorio original. Mientras estos checks no sean obligatorios, un workflow fallido informa del error pero no impide por sí solo la fusión. Consultar la [documentación de protección de ramas de GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

## Ampliación: backend y Spec-Driven Development

El frontend conserva estructura y comandos en la raíz. Backend en `backend/` con dependencias independientes. GET, POST, PUT y DELETE se completan con PATCH y la integración React–API de HU-14 / SMARLIST-15. MySQL es la única persistencia activa. HU-15 (SMARLIST-19) agrega la categoría de producto en la API. HU-01 a HU-08 documentan la etapa original, cuyos requisitos históricos se conservan.

### Instalar y ejecutar el backend

Desde la raíz:

```sh
cd backend
npm ci
```

Copiar `.env.example` a `.env` y ajustar la configuración local. No publicar `.env` ni contraseñas. Express puede iniciar sin MySQL. CORS permite el origen definido por `FRONTEND_ORIGIN`, inicialmente `http://localhost:5173`; si Vite utiliza otro puerto, ajustar ese valor.

```sh
npm run dev
npm start
npm test
npm run test:watch
```

`dev` usa el modo watch nativo de Node. `start` ejecuta el servidor sin watch. El puerto predeterminado es 3000. Comprobar `GET http://localhost:3000/health`: debe responder 200 con `{"status":"ok"}`. No consulta MySQL. Las pruebas utilizan Vitest y Supertest y no requieren una base de datos real.

`src/config/database.js` exporta `getPool`, `checkDatabaseConnection` y `closePool`. Importarlo no crea conexiones. Configurar MySQL local con `DB_HOST=localhost`, `DB_PORT=3306`, `DB_NAME=smartlist_db` y el usuario/contraseña exclusivamente en `.env`. El usuario `root` se utiliza solo para esta práctica local; para otro entorno conviene un usuario con privilegios mínimos.

### HU-09: consultar productos en MySQL

Requiere MySQL >= 8.0.16 para restricciones CHECK efectivas. Desde `backend/`:

```sh
npm run db:init
npm test
npm run test:mysql
npm start
```

`db:init` inspecciona versión, existencia y estructura antes de crear únicamente `smartlist_db` y `products` faltantes. Migra únicamente las estructuras anteriores reconocidas (category y creation_order); ante incompatibilidad se detiene para revisión. No ejecuta DDL durante importación, inicio del servidor o solicitudes. `database/schema.sql` contiene los cinco atributos públicos y la secuencia interna de registro.

`GET http://localhost:3000/api/products` devuelve HTTP 200 y un arreglo JSON directo, ordenado por `creation_order ASC`, la secuencia persistente generada por MySQL. Una lista vacía devuelve `[]`. Cada registro contiene `id`, `name`, `quantity`, `category` y `purchased` booleano; quantity no expande registros. La consulta conserva datos y nombres repetidos. MySQL no disponible devuelve HTTP 503 con `{"error":"Servicio temporalmente no disponible"}`; errores inesperados conservan la respuesta 500 genérica existente. `/health` sigue siendo independiente de MySQL.

`npm test` no necesita MySQL real; las suites reales se omiten por defecto. `npm run test:mysql` las activa explícitamente y requiere `smartlist_db` local preparada. Se ejecutan secuencialmente para proteger las comprobaciones de colección inicial/final. Crean fixtures identificables y limpian únicamente sus IDs; verifican consulta, registro, edición, eliminación, orden, restricciones y persistencia. No utilizar las suites reales en producción. PATCH y la integración están implementados; no hay importación desde localStorage. Las pruebas comparan datos y esquema antes y después y no eliminan registros preexistentes del usuario.

Artefactos y evidencia de HU-09: `specs/001-consultar-productos/`. La clave Jira definitiva todavía no está confirmada.

### HU-11 / SMARLIST-12: registrar productos

`POST http://localhost:3000/api/products` recibe un objeto JSON con únicamente `name` y `quantity`. Ejemplo: `{"name":"  Arroz  ","quantity":2}`. Responde HTTP 201 con `{"id":"UUID generado","name":"Arroz","quantity":2,"purchased":false}` y el producto queda disponible en GET. ID y estado se generan exclusivamente en el servidor; nombres repetidos producen registros independientes.

El nombre debe ser string válido, no vacío después de trim y de hasta 150 caracteres Unicode. La cantidad debe ser number entero entre 1 y 2147483647, sin convertir strings. Cuerpo incorrecto, datos inválidos, campos adicionales o intentos de establecer id/purchased reciben 400 con `{"error":{"message":"mensaje público"}}`, antes de insertar. JSON malformado recibe el mensaje genérico `JSON inválido.`. Errores de MySQL mantienen los contratos seguros 503/500 de HU-09. Se reutilizan esquema y pool existentes, sin DDL ni dependencias nuevas.

Para comprobar manualmente, enviar POST con Content-Type application/json, recuperar el ID mediante GET y probar quantity string o nombre vacío:400. Los registros manuales son persistentes; HU-13 ofrece DELETE por UUID para retirar exclusivamente los fixtures propios. Las pruebas automatizadas limpian solo sus propios datos. Un reintento de POST puede crear otro registro: no se implementa deduplicación de solicitudes.

Artefactos SDD y evidencia: `specs/002-registro-productos/`. Mantenimiento separado en la misma rama: encabezado h1 corregido a `SmartList`, sin modificar pruebas, estilos, funcionalidades React ni localStorage.

### HU-12 / SMARLIST-13: editar productos

`PUT http://localhost:3000/api/products/:id` exige un objeto JSON completo con únicamente `name` y `quantity`, usando las mismas validaciones de POST. Ejemplo: `{"name":"  Arroz integral  ","quantity":3}`. Devuelve200 con el nombre normalizado, cantidad actualizada y los valores originales de `id` y `purchased`, también si no cambian los datos. No genera UUID ni crea productos inexistentes.

El ID es un string bien formado de1..36 unidades UTF-16, no vacío y sin espacios externos; no se normaliza ni se restringe a UUID para conservar compatibilidad con HU-09. ID/cuerpo inválidos:400; ID válido inexistente con cuerpo válido:404 y `{"error":{"message":"Producto no encontrado."}}`. No se admite id/purchased o campos adicionales en el cuerpo. Infraestructura503/500 mantiene contratos existentes.

La edición usa una conexión y transacción InnoDB: consulta por ID con FOR UPDATE y UPDATE parametrizado únicamente de nombre/cantidad. La lectura determina existencia; no se interpreta cero cambios como404. Se preserva el estado vigente de compra y no se alteran otros registros. El esquema existente, sin triggers transformadores, permite devolver los datos confirmados sin una tercera consulta.

Para comprobar manualmente, registrar un producto, conservar su ID, enviar PUT, recuperarlo por GET y repetir los mismos valores:200. Probar cantidad string:400 y un ID válido inexistente:404. Las pruebas reales verifican ambos estados, reinicio y limpieza exclusiva de fixtures; no modificar registros ajenos. Artefactos y resultados en `specs/003-edicion-productos/`. Frontend y localStorage permanecen intactos.

### HU-13 / SMARLIST-14: eliminar productos

`DELETE http://localhost:3000/api/products/:id` elimina físicamente solo el producto identificado, tanto pendiente como comprado. Devuelve **204 sin cuerpo ni JSON**. Un UUID válido inexistente, incluido un segundo intento sobre el mismo ID, responde 404 con `{"error":{"message":"Producto no encontrado."}}`.

DELETE exige UUID hexadecimal con estructura 8-4-4-4-12, sin espacios y sin restringir versión. El valor se compara exactamente, sin normalizarlo. ID inválido responde 400 antes de SQL. Se comparte la validación básica con PUT, que conserva su contrato anterior de strings; la exigencia UUID aplica exclusivamente al nuevo DELETE. Los errores 503/500 mantienen los contratos seguros existentes.

El repositorio utiliza una única sentencia parametrizada `DELETE FROM products WHERE id = ?`; cero filas afectadas significa inexistencia y una fila confirma eliminación. No se selecciona por nombre o estado, no hay borrado lógico ni recuperación, y el registro no reaparece tras consultar o reiniciar.

Para comprobarlo, crear un fixture propio mediante POST, registrar su UUID, eliminarlo y consultar GET; repetir DELETE debe devolver 404. No usar productos preexistentes como datos de prueba. Las suites reales verifican integridad, persistencia y limpieza limitada a IDs propios. Artefactos y resultados: `specs/004-eliminacion-productos/`. Frontend, localStorage y esquema no cambian.

### HU-15 / SMARLIST-19: categorías de productos (backend)

Cada producto tiene `category`, uno de un conjunto fijo: `Frutas y verduras`, `Carnes y pescados`, `Lácteos`, `Panadería`, `Despensa`, `Bebidas`, `Aseo` y `Otros` (por defecto). GET, POST y PUT devuelven el producto con `id`, `name`, `quantity`, `purchased` y `category`.

POST y PUT aceptan `category` opcional. POST sin categoría crea el producto en `Otros`; PUT sin categoría conserva la actual. La categoría debe coincidir exactamente con un valor de la lista (sin normalizar mayúsculas, tildes ni espacios); cualquier otro valor, incluido `null`, responde 400 antes de acceder a MySQL.

La columna es `category VARCHAR(30) NOT NULL DEFAULT 'Otros'`. Para bases existentes, ejecutar `npm run db:init`: si la tabla `products` coincide con la estructura anterior, se agrega la columna con `database/add-product-category.sql` y todos los productos existentes quedan en `Otros` (la salida indica `"categoryAdded":true`). Repetir la inicialización no ejecuta DDL.

En la interfaz (SMARLIST-22), el formulario de registro y la edición de cada producto tienen un selector "Categoría" (registro con "Otros" por defecto; edición precargada con la categoría actual) y cada producto de la lista muestra su categoría. El cliente `src/services/productsApi.js` exige una categoría válida en cada producto recibido. La lista de categorías del frontend (`src/utils/productCategories.js`) replica la del backend y una prueba verifica que coinciden. Artefactos: `specs/007-categorias-interfaz/`.

### HU-16 / SMARLIST-20: filtrar y agrupar por categoría

Junto a los filtros de estado hay un selector "Categoría" ("Todas" y las 8 categorías) que se combina con el estado y con la búsqueda por nombre. Si la categoría no tiene coincidencias se muestra "No hay productos en la categoría X" (o "pendientes"/"comprados" según el filtro de estado). El botón "Agrupar por categoría" alterna entre la lista normal y una vista con una sección por categoría, en el orden fijo, con encabezado y la cantidad de productos pendientes de esa categoría en toda la lista; las categorías sin productos visibles no se muestran. El resumen sigue siendo global. Filtros y agrupación no se guardan al recargar. Artefactos: `specs/008-filtrar-agrupar-categoria/`. Artefactos y resultados: `specs/006-categorias-productos/`.

### Spec Kit con Codex

Spec Kit 1.0.13 se inicializó oficialmente en la raíz, con scripts `sh` e integración Codex en `.agents/skills/`. `.specify/` contiene plantillas, manifiestos, scripts y el flujo instalado. La Constitution v1.0.0 está aprobada y ratificada el 2026-10-13. HU-09 conserva especificación, aclaraciones, plan, investigación, modelo, contrato, tareas y validación en su directorio. El ejecutable instalado está en `C:/Users/judri/.local/bin/specify.exe`; si `specify` no se reconoce, añadir ese directorio al PATH local.

Para usar las nuevas habilidades, abrir o recargar Codex en este repositorio. Se invocan con sus nombres `$speckit-*`, no como comandos npm. Los scripts `sh` necesitan Bash; en Windows está disponible Git Bash. Revisar cada etapa antes de continuar:

| Etapa | Habilidad | Resultado esperado |
|---|---|---|
| Constitution | `$speckit-constitution` | Principios acordados en `.specify/memory/constitution.md` |
| Specify | `$speckit-specify` | Especificación de una funcionalidad en `specs/<funcionalidad>/spec.md` |
| Clarify | `$speckit-clarify` | Preguntas y respuestas incorporadas a la especificación |
| Plan | `$speckit-plan` | `plan.md` y, según alcance, investigación, modelo, contratos y guía de validación |
| Tasks | `$speckit-tasks` | `tasks.md` con tareas vinculadas a la especificación |
| Analyze | `$speckit-analyze` | Informe de consistencia de especificación, plan y tareas |
| Implement | `$speckit-implement` | Código y pruebas según las tareas aprobadas |

Las especificaciones se almacenan en el repositorio. La habilidad Specify puede crear una rama; deberá autorizarse expresamente antes de usarla, conforme a AGENTS.md. No ejecutar etapas en cadena sin autorización ni commits automáticos. Las instrucciones actuales del usuario prevalecen sobre las automatizaciones de las habilidades. HU-09 recibió autorización general para las fases restantes sin cambios de rama.

Las nuevas historias deben respetar los siete principios de `.specify/memory/constitution.md` y seguir Specify → Clarify → Plan → Tasks → Analyze → Implement con las aprobaciones aplicables. La integración frontend requiere su propia historia autorizada.

### HU-14 / SMARLIST-15: integración Full Stack y estado

`PATCH /api/products/:id/status` recibe exclusivamente `{"purchased":true}` o false. UUID como DELETE, booleano estricto sin coerción. Responde200 con producto completo, incluso con el mismo estado;400 inválido,404 inexistente,503 indisponible seguro. Solo cambia purchased con SQL parametrizado en las capas existentes; conserva id/name/quantity y el esquema.

React usa GET/POST/PUT/PATCH/DELETE a través de `src/services/productsApi.js`. Los formularios esperan confirmación, DELETE espera204 sin interpretar JSON y el servidor genera IDs. Filtros/resumen se calculan desde la colección global sin escrituras. Carga cancelable y cola serializada protegen de respuestas obsoletas y alternancias consecutivas.

Comprobación: iniciar MySQL, `npm start` en backend y `npm run dev` en raíz. Registrar fixture propio, editar, marcar/desmarcar, cambiar filtros y comprobar resumen; recargar para recuperar desde MySQL y eliminar el fixture. Revisar teclado y móvil. No utilizar datos preexistentes para pruebas. Ejecutar `npm test` en ambos proyectos, `npm run test:mysql` en backend y `npm run build` en raíz. Artefactos y evidencia real: `specs/005-integracion-full-stack/validation.md`.

### SMARLIST-23: conservar el orden de registro

MySQL asigna `creation_order BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` con índice único. GET ordena por esta secuencia sin exponerla en JSON; el UUID sigue siendo el identificador público. No depende de timestamps ni del reloj del cliente. Inserciones simultáneas se ordenan por la asignación de secuencia de MySQL, sin prometer el orden de llegada HTTP ni de confirmación de transacciones; pueden existir saltos por inserciones fallidas.

Con el backend detenido, ejecutar `npm run db:init` desde `backend/` antes de iniciar la versión actualizada. No ejecutar el archivo SQL de migración directamente: el inicializador coordina sus etapas. Se requiere permiso LOCK TABLES además de los permisos de inicialización existentes. La migración añade una columna nullable, bloquea products para escribir y numera las filas en orden `BINARY id ASC`; finalmente activa AUTO_INCREMENT y su índice único. No reconstruye el orden histórico real. Los productos nuevos quedan después de los anteriores. No se eliminan productos ni se recrea la tabla mediante DROP/CREATE. El bloqueo y ALTER pueden demorar según el tamaño de la tabla.

La salida añade `creationOrderAdded`. Repetir la inicialización no cambia secuencias ni ejecuta DDL sobre un esquema actualizado. Una interrupción antes del último ALTER deja una columna nullable reconocida: repetir db:init con el backend detenido retoma el relleno. No ejecutar inicializadores simultáneos.

Validación: `npm test -- --maxWorkers=1` en raíz y backend; `npm run build` en raíz; `npm run test:mysql` en backend con una base local preparada. Las pruebas de migración crean y eliminan únicamente esquemas desechables con prefijo smartlist_order_test_ y requieren permiso CREATE/DROP DATABASE. Incluyen esquema vacío, anteriores sin/con categoría, migración interrumpida e idempotencia. Las pruebas HTTP verifican registros rápidos, concurrencia, reconexión y reinicio real del proceso servidor.

Comprobación manual: registrar Leche → Queso → Pan → Jabón en la vista sin agrupación, recargar y reiniciar el backend; consultar GET /api/products y comprobar el mismo orden. Los filtros conservan el orden relativo; la agrupación opcional conserva el orden dentro de cada categoría. Las pruebas de React remontan la aplicación con HTTP simulado y no sustituyen una comprobación visual en navegador.
