---
inclusion: always
---

# SmartList: organización del repositorio

Abrir la raíz del repositorio como workspace de Kiro, para conservar el contexto conjunto de frontend, backend y documentación. Las instrucciones comunes permanecen en AGENTS.md; backend/AGENTS.md complementa su ámbito.

## Código existente

| Ruta | Responsabilidad |
|---|---|
| src/App.jsx | Composición, búsqueda/filtros/agrupación temporales, vista derivada y resumen global |
| src/components/ShoppingForm.jsx | Registro con validación y espera de confirmación |
| src/components/ShoppingItem.jsx | Producto, checkbox, edición local y eliminación |
| src/components/ShoppingList.jsx | Lista normal o agrupada y mensajes vacíos |
| src/components/ShoppingFilters.jsx | Estado, selector de categoría y agrupación |
| src/components/ProductSearch.jsx | Campo de búsqueda y limpieza de esa búsqueda |
| src/components/CategorySelect.jsx | Selector reutilizado por registro y edición |
| src/components/ShoppingSummary.jsx | Presentación de contadores derivados |
| src/hooks/useShoppingList.js | Única colección confirmada, carga y cola de mutaciones asíncronas |
| src/services/productsApi.js | Cliente HTTP de los cinco endpoints |
| src/utils/productFilters.js | Predicados puros, normalización, agrupación y mensajes |
| src/utils/productCategories.js | Categorías válidas del frontend |
| src/utils/shoppingListStorage.js | Utilidad histórica, sin uso activo en producción |
| src/main.jsx; src/App.css | Montaje React y estilos |

Backend en `backend/`, con package.json y lockfile propios:

- `src/app.js` compone Express; `src/server.js` inicia el servidor.
- `src/routes/productRoutes.js` → `controllers/productController.js` → `services/productService.js` → `repositories/productRepository.js`.
- `src/services/productCategories.js` define categorías del backend.
- `src/config/` concentra entorno, pool e inicialización explícita; `src/middleware/errorHandler.js` responde errores.
- `database/` contiene esquema, migración de categoría y ejecutable de inicialización.
- `tests/` conserva pruebas aisladas y archivos `.mysql.test.js` de integración.

Las pruebas frontend están en `tests/` de la raíz; `tests/helpers/productsServer.js` simula la API. Vite ejecuta únicamente esa suite; la suite backend tiene configuración propia.

## Documentación y herramientas

- `docs/requirements.md`, `docs/architecture.md`, `docs/stories/`: requisitos y decisiones del proyecto, con partes históricas.
- `specs/`: nueve especificaciones históricas con planes, contratos, tareas y evidencia. Hay dos directorios que comienzan por 004, de búsqueda y eliminación; referenciar el nombre completo, sin renumerarlos.
- `.specify/`: Constitution, scripts y plantillas de GitHub Spec Kit.
- `.agents/skills/speckit-*/`: habilidades oficiales existentes de Codex. No reemplazarlas por archivos Kiro.
- `.kiro/steering/`: contexto nativo de producto, tecnología y estructura.
- `.kiro/specs/<nombre-descriptivo>/`: ubicación propuesta para futuras Specs nativas, todavía no creadas.

## Adopción incremental de Specs

Para una historia nueva autorizada, usar Feature Spec Requirements-First en Kiro: `requirements.md` con criterios verificables, `design.md` con decisiones y estrategia de pruebas, y `tasks.md` con tareas trazables. Referenciar historias/contratos históricos pertinentes sin copiarlos ni reabrir tareas ya completas. Relacionar la Spec con Jira cuando exista una clave confirmada.

Resolver dudas antes del diseño y revisar coherencia entre requisitos, diseño y tareas antes de implementar. Ejecutar tareas aprobadas y las pruebas pertinentes, conservando evidencia de resultados y limitaciones. No iniciar implementación a partir de una propuesta ni ejecutar automáticamente todas las tareas por cargar el workspace.

Los documentos históricos no se convierten o trasladan en bloque. Para historias backend, aplicar además la condición de gobernanza indicada en tech.md antes de sustituir el flujo Spec Kit.

Referencias del formato nativo: [Steering](https://kiro.dev/docs/steering/) y [Specs](https://kiro.dev/docs/specs/).
