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
- Conservar la lista mediante almacenamiento local.
- Consultar un resumen de productos comprados y pendientes.

Las funcionalidades se implementarán progresivamente de acuerdo con las historias de usuario definidas en Jira.

## Tecnologías utilizadas

| Tecnología | Propósito |
|---|---|
| React | Construcción de la interfaz de usuario |
| Vite | Entorno de desarrollo y compilación |
| JavaScript | Implementación de la lógica de la aplicación |
| CSS | Estilos y diseño adaptable |
| localStorage | Persistencia local de productos |
| Vitest | Pruebas automatizadas |
| Git y GitHub | Control de versiones y repositorio |
| Jira | Gestión de historias de usuario |
| Codex | Asistencia de inteligencia artificial para el desarrollo |

## Arquitectura

SmartList utiliza una arquitectura frontend basada en componentes de React, organizada por responsabilidades técnicas.

La interfaz se divide en componentes reutilizables y la lógica de estado se administra mediante hooks personalizados.

No se requiere backend ni base de datos externa. La persistencia se realizará mediante `localStorage` del navegador.

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
│   ├── hooks/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
└── tests/
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

#### Verificación manual de HU-07

1. Agregar productos, editar nombre y cantidad, marcar o desmarcar y recargar: los atributos deben conservarse.
2. Cerrar y reabrir la aplicación en el mismo navegador y origen: debe recuperarse la lista.
3. Eliminar un producto y recargar: no debe reaparecer. Eliminar todos y recargar: debe mantenerse la lista vacía.
4. Cambiar filtros o cancelar un borrador: no debe alterarse lo guardado. Al recargar, el filtro vuelve a Todos.

#### Almacenamiento y errores

Se utiliza la clave `smartlist.products`, con un arreglo JSON de productos. Se valida la colección completa sin convertir tipos ni regenerar IDs; si algún registro es inválido, se rechaza toda la colección. El montaje nunca escribe, incluso en StrictMode.

Sin datos se inicia una lista vacía. Ante JSON corrupto o datos inválidos se inicia vacío en memoria y se conserva inicialmente el contenido original. La primera modificación válida confirmada reemplaza ese contenido por la colección actual en memoria; filtros, borradores, cancelaciones y operaciones rechazadas no lo reemplazan.

Si falla el acceso o la lectura, se bloquean escrituras durante esa sesión para proteger datos desconocidos. Si falla una escritura, se conserva el estado en memoria y el contenido anterior; el siguiente cambio confirmado vuelve a intentar guardar. No hay indicador visual de esos fallos, por lo que los cambios en memoria pueden perderse al recargar.

localStorage depende de navegador, perfil y origen (protocolo, host y puerto). Borrar sus datos elimina la lista; no hay sincronización entre dispositivos o pestañas. No se guardan filtros, formularios, borradores ni mensajes de error.

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

HU-01 permite agregar productos con nombre y cantidad y validar los datos. HU-02 muestra todos los registros con su nombre, cantidad y estado recibido (Pendiente o Comprado), y el mensaje "Tu lista de compras está vacía" cuando no hay productos. HU-03 permite marcar y desmarcar cada producto mediante un checkbox accesible; los comprados muestran su nombre tachado. HU-04 permite eliminar cada producto mediante su botón, conservando los demás registros. Al eliminar el último, aparece el mensaje de lista vacía. HU-05 permite editar nombre y cantidad, validar, guardar o cancelar sin alterar el identificador ni el estado de compra. HU-06 permite filtrar por Todos, Pendientes y Comprados, con indicador del filtro activo y mensajes sin resultados. Los filtros conservan los datos y el orden de registro. Todas estas operaciones actualizan la interfaz inmediatamente. HU-07 guarda automáticamente los cambios de productos en localStorage y los recupera al recargar o reabrir en el mismo origen. HU-08 muestra el total global de registros, pendientes y comprados, con actualización automática y sin depender del filtro. Las ocho historias del alcance inicial están implementadas; la revisión final del proyecto sigue correspondiendo al equipo.

Las funcionalidades se incorporan progresivamente mediante historias de usuario y control de versiones en GitHub.

## Alcance

SmartList es una aplicación educativa. No contempla autenticación, colaboración entre usuarios, compras en línea, pagos ni integración con servicios externos.

La información se almacena localmente en el navegador y origen utilizados, sin sincronización entre dispositivos. Si el almacenamiento no está disponible, la aplicación continúa en memoria.

## Ampliación: backend y Spec-Driven Development

El frontend conserva su estructura en la raíz, sus comandos npm y la persistencia con localStorage. La nueva base técnica vive en `backend/` con un `package.json` y un lockfile independientes. Aún no existen endpoints de productos, tablas MySQL ni integración de React con el servidor. Los requisitos originales de HU-01 a HU-08 documentan el alcance frontend anterior; esta ampliación no los modifica.

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

`src/config/database.js` exporta `getPool`, `checkDatabaseConnection` y `closePool`. Importarlo no crea conexiones. La comprobación es explícita y queda pendiente de contar con MySQL y las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`. No se ejecutó SQL ni se creó el esquema; `database/schema.sql` contiene solo comentarios.

### Spec Kit con Codex

Spec Kit 1.0.13 se inicializó oficialmente en la raíz, con scripts `sh` e integración Codex en `.agents/skills/`. `.specify/` contiene plantillas, manifiestos, scripts y el flujo instalado. La Constitution existente es una plantilla sin completar: no se ejecutó ninguna fase funcional. El ejecutable instalado está en `C:/Users/judri/.local/bin/specify.exe`; si `specify` no se reconoce, añadir ese directorio al PATH local.

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

Las futuras especificaciones se almacenarán en el repositorio. La habilidad Specify puede crear una rama; deberá autorizarse expresamente antes de usarla, conforme a AGENTS.md. No ejecutar etapas en cadena ni commits automáticos. Las instrucciones actuales del usuario prevalecen sobre las automatizaciones de las habilidades.

Para comenzar Constitution, solicitar principios para Node.js/Express/MySQL, arquitectura Routes → Controllers → Services → Repositories, JavaScript/ES Modules, SQL parametrizado, credenciales por entorno, pruebas, preservación del frontend y revisión individual de fases. Aclarar primero que el nuevo alcance autoriza backend mientras los requisitos originales describen el frontend. Ese paso se realizará después de revisar esta configuración.
