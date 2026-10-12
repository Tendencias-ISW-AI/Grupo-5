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
6. Recargar la página: la lista vuelve a estar vacía porque HU-07 aún no está implementada.

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

HU-01 permite agregar productos con nombre y cantidad y validar los datos. HU-02 muestra todos los registros con su nombre, cantidad y estado recibido (Pendiente o Comprado), y el mensaje "Tu lista de compras está vacía" cuando no hay productos. Los nuevos registros aparecen inmediatamente. Todavía no existen controles para cambiar el estado de compra. La lista funciona en memoria: se reinicia al recargar. Las demás historias, incluida la persistencia, están pendientes.

Las funcionalidades se incorporan progresivamente mediante historias de usuario y control de versiones en GitHub.

## Alcance

SmartList es una aplicación educativa. No contempla autenticación, colaboración entre usuarios, compras en línea, pagos ni integración con servicios externos.

Cuando se implemente HU-07, la información se almacenará localmente en el navegador y no se sincronizará entre dispositivos. Actualmente la lista se mantiene únicamente en memoria.
