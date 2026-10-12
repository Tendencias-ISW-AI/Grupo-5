# Arquitectura inicial

## Estructura y responsabilidades

- `index.html`: documento HTML y contenedor raíz.
- `src/main.jsx`: montaje de React e importación de estilos globales.
- `src/App.jsx`: pantalla inicial y composición de componentes.
- `src/App.css`: CSS convencional y adaptación básica a pantallas pequeñas.
- `src/components/ShoppingForm.jsx`: componente reservado para HU-01; devuelve `null` hasta definir la historia.
- `src/components/ShoppingList.jsx`: estructura de lista y composición de ítems; recibe `items`.
- `src/components/ShoppingItem.jsx`: presentación mínima del nombre de un ítem.
- `src/hooks/useShoppingList.js`: estado inicial vacío mediante `useState`; solo expone `items`.
- `tests/shoppingList.test.js`: verifica el renderizado inicial con una lista vacía.
- `vite.config.js`: plugin React y configuración de Vitest.
- `docs/`: requisitos, decisiones e historias; `AGENTS.md` contiene reglas de trabajo.

## Decisiones

Se utiliza Vite en la raíz del repositorio y el plugin oficial de React para JSX. No se incluyen router, gestión de estado externa ni bibliotecas de interfaz porque no son necesarias para esta etapa.

Vitest se ejecuta en Node. La prueba básica utiliza el renderizador de React para comprobar la composición inicial sin añadir un entorno DOM ni bibliotecas adicionales. Las futuras pruebas interactivas podrán requerir revisar esta decisión.

El hook concentra el estado inicial para preparar su evolución. No expone mutaciones ni accede a localStorage. La persistencia se incorporará cuando su alcance esté definido.

El contrato provisional de presentación de un ítem es `{ id, name }`. Es un supuesto técnico para preparar los componentes, no una regla aprobada. No se agregan datos de ejemplo ni productos al estado inicial.

## Límites y evolución pendiente

La pantalla confirma que la aplicación inicia; el formulario no es interactivo. Los detalles de HU-01 y de la persistencia siguen pendientes. No existen backend, autenticación ni integraciones configuradas con Jira o GitHub.
