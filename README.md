# SmartList

Aplicación web educativa para gestionar listas de compras. Forma parte de una actividad académica que utiliza Codex para desarrollo asistido, Jira para historias de usuario y GitHub para control de versiones.

## Estado y alcance

Esta entrega prepara la estructura y una pantalla mínima. No implementa agregar productos, otras operaciones de negocio ni persistencia. HU-01 requiere criterios de aceptación antes de su desarrollo.

## Tecnologías

React, Vite, JavaScript (JSX), CSS convencional, npm y Vitest. Se utilizará localStorage en una etapa futura. No hay backend, base de datos externa ni autenticación.

## Instalación y ejecución

Requisito de entorno: Node.js 22.12 o superior de la rama 22, o una versión LTS posterior compatible con las dependencias, y npm. La configuración inicial se validó con Node.js 22.14.0.

```sh
npm ci
npm run dev
```

Abrir la dirección que Vite muestra en la terminal.

```sh
npm run build
npm run preview
npm test
npm run test:watch
```

`build` genera `dist/`; `preview` permite revisar esa compilación localmente. `test` ejecuta las pruebas una vez y `test:watch` las mantiene en modo interactivo.

## Organización

- `src/components/`: formulario, lista e ítem preparados para futuras historias.
- `src/hooks/`: estado inicial de la lista, sin operaciones de negocio.
- `src/App.jsx`, `src/App.css`, `src/main.jsx`: composición, estilos y punto de entrada.
- `tests/shoppingList.test.js`: prueba básica del renderizado inicial.
- `docs/requirements.md`: alcance y requisitos conocidos.
- `docs/architecture.md`: responsabilidades y decisiones.
- `docs/stories/HU-01-agregar-producto.md`: borrador de historia pendiente de definición.
- `AGENTS.md`: reglas de desarrollo asistido.

## Supuestos y pendientes

La prueba se ubica en `tests/`, interpretando así la estructura solicitada. Para preparar los componentes se asume provisionalmente que un ítem tendrá `id` y `name`; no es un requisito de negocio aprobado. Faltan campos, validaciones y criterios de aceptación de HU-01, así como detalles de la persistencia futura. No se configura integración con Jira o GitHub en esta entrega.

## Licencia

Se conserva la licencia MIT existente en `LICENSE`.
