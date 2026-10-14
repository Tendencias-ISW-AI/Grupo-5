# Diagramas técnicos de SmartList

Los diagramas representan el código implementado en el repositorio, revisado el 2026-10-14. La revisión utiliza los archivos fuente y `backend/database/schema.sql`; no consulta ni ejecuta operaciones sobre MySQL.

## Archivos y explicación

| Archivo fuente | Formato | Qué representa |
|---|---|---|
| [casos-de-uso.puml](casos-de-uso.puml) | PlantUML | Un usuario registra, visualiza, edita, marca/desmarca, elimina, filtra y consulta el resumen. La recuperación de productos guardados forma parte de abrir o recargar la lista. |
| [arquitectura-full-stack.mmd](arquitectura-full-stack.mmd) | Mermaid flowchart | React y sus componentes, el hook y el cliente fetch se conectan a Express. La API sigue Routes → Controllers → Services → Repositories → pool mysql2/promise → MySQL. Se incluyen los cinco endpoints, CORS/JSON y manejo de errores existentes. |
| [modelo-entidad-relacion.mmd](modelo-entidad-relacion.mmd) | Mermaid ER | La única tabla declarada, `smartlist_db.products`, con sus cuatro columnas, clave primaria, nulabilidad, tipos y restricciones. No hay claves foráneas ni relaciones que representar. |
| [secuencia-registro-producto.mmd](secuencia-registro-producto.mmd) | Mermaid sequenceDiagram | Registro desde el formulario hasta INSERT parametrizado, HTTP 201 y actualización de React. Incluye validación local, rechazo HTTP 400 y errores de almacenamiento 503/500, conservando campos y datos cuando falla. |

## Alcance y trazabilidad

- Interfaz y valores derivados: `src/App.jsx`, `src/components/ShoppingForm.jsx`, `ShoppingItem.jsx`, `ShoppingList.jsx`, `ShoppingFilters.jsx` y `ShoppingSummary.jsx`.
- Estado y llamadas HTTP: `src/hooks/useShoppingList.js` y `src/services/productsApi.js`. Los productos se incorporan o cambian únicamente tras confirmación; el servidor genera los IDs.
- API y capas: `backend/src/app.js`, `routes/productRoutes.js`, `controllers/productController.js`, `services/productService.js` y `repositories/productRepository.js`.
- Pool y errores: `backend/src/config/database.js` y `backend/src/middleware/errorHandler.js`.
- Base de datos: `backend/database/schema.sql`. `id` tiene colación `utf8mb4_bin`; los CHECK exigen ID/nombre no vacíos tras TRIM, cantidad positiva y purchased en 0/1. BOOLEAN es el alias MySQL de TINYINT(1), convertido a booleano en JSON. El esquema permite nombres repetidos.

Los puertos 5173 y 3000 son los valores locales documentados, no requisitos de despliegue. `GET /health` existe y no depende de MySQL; no es una funcionalidad de compras del usuario. Filtros y resumen se calculan en React desde la colección completa, sin endpoints adicionales. El total cuenta registros, no cantidades.

AGENTS.md y algunos párrafos históricos de README/architecture/requirements todavía describen la etapa de persistencia local. La sección HU-14 y el código vigente confirman MySQL como persistencia activa. El módulo histórico de localStorage fue retirado y no se representa como almacén activo. Los diagramas no añaden usuarios en la base de datos, autenticación, tablas de listas, relaciones, migración local o servicios que no existen.

## Lectura y validación

Abrir `.puml` en un visor PlantUML y `.mmd` en un visor Mermaid. También se pueden pegar los archivos `.mmd` dentro de un bloque Markdown con etiqueta `mermaid`.

Validación ejecutada:

- Los tres archivos `.mmd` pasaron `mermaid.parse`: tipos reconocidos `flowchart-v2`, `er` y `sequence`. Se utilizó el motor Mermaid ya disponible en el entorno y jsdom existente, sin instalar dependencias.
- `casos-de-uso.puml` fue renderizado correctamente como SVG por el servidor oficial PlantUML: HTTP 200, SVG válido y sin errores de sintaxis. Solo se envió el texto del diagrama de casos de uso, sin credenciales ni código de la aplicación.
- Se contrastaron las cuatro columnas y las restricciones del ER con `schema.sql`, y los métodos/rutas con `productRoutes.js` y `productsApi.js`.

Estas comprobaciones validan los diagramas; no verifican una base de datos en ejecución. No se ejecutó SQL, ni se iniciaron servidores, pruebas MySQL o fases SDD. Solo se crearon los archivos de esta carpeta; no cambiaron dependencias ni código de producción.

Referencias de formato: [PlantUML, casos de uso](https://plantuml.com/use-case-diagram) y [Mermaid, diagramas](https://mermaid.js.org/intro/).
