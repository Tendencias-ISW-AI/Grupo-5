# Trazabilidad y discrepancias documentales — SmartList

## 1. Alcance de la revisión

Revisión del 2026-10-14 para [SMARLIST-25](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-25), en la rama `feature/SMARTLIST-25-update-doc`, basada en el commit `0a9f292`. Solo se modifica documentación; no se cambian Jira, código, pruebas, SQL ni infraestructura. El estado «Listo» de un ticket no demuestra que su cambio esté integrado en este checkout.

Se consultó Jira en el proyecto **smartlist**, clave **SMARLIST**, mediante la búsqueda del proyecto completa (`project = SMARLIST ORDER BY key ASC`, última página confirmada). Se recuperaron títulos, descripciones disponibles, criterios, estado, padre y enlaces. La numeración de la rama SMARTLIST-25 no sustituye la clave real **SMARLIST-25**.

## 2. Correspondencia de historias verificada en Jira

| HU | Clave Jira | Título verificado | Fuente local |
|---|---|---|---|
| HU-01 | [SMARLIST-1](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-1) | HU-01 Agregar un producto | [Historia](stories/HU-01-agregar-producto.md) |
| HU-02 | [SMARLIST-3](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-3) | HU-02 Visualizar lista de productos | [Historia](stories/HU-02-visualizar-productos.md) |
| HU-03 | [SMARLIST-4](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-4) | HU-03 Marcar producto como comprado | [Historia](stories/HU-03-marcar-producto-comprado.md) |
| HU-04 | [SMARLIST-5](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-5) | HU-04 Eliminar un producto | [Historia](stories/HU-04-eliminar-producto.md) |
| HU-05 | [SMARLIST-6](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-6) | HU-05 Editar un producto | [Historia](stories/HU-05-editar-producto.md) |
| HU-06 | [SMARLIST-7](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-7) | HU-06 Filtrar productos por estado | [Historia](stories/HU-06-filtrar-productos.md) |
| HU-07 | [SMARLIST-8](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-8) | HU-07 Conservar productos guardados | [Historia](stories/HU-07-conservar-productos.md) |
| HU-08 | [SMARLIST-9](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-9) | HU-08 Visualizar resumen de compras | [Historia](stories/HU-08-visualizar-resumen-compras.md) |
| HU-09 | [SMARLIST-10](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-10) | HU-09 Mejorar interfaz visual y adaptación responsive | [Historia](stories/HU-09-mejorar-interfaz-responsive.md) |
| HU-10 | [SMARLIST-11](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-11) | HU-10 · CONSULTA DE PRODUCTOS | [Historia](stories/HU-10-consultar-productos.md) |
| HU-11 | [SMARLIST-12](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-12) | HU-11 · REGISTRO DE PRODUCTOS | [Historia](stories/HU-11-registrar-productos.md) |
| HU-12 | [SMARLIST-13](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-13) | HU-12 · EDICIÓN DE PRODUCTOS | [Historia](stories/HU-12-editar-productos.md) |
| HU-13 | [SMARLIST-14](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-14) | HU-13 · ELIMINACIÓN DE PRODUCTOS | [Historia](stories/HU-13-eliminar-productos-mysql.md) |
| HU-14 | [SMARLIST-15](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-15) | HU-14 · INTEGRACIÓN FULL STACK | [Historia](stories/HU-14-integracion-full-stack.md) |
| HU-15 | [SMARLIST-19](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-19); [SMARLIST-22](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-22) | HU-15 · CATEGORÍAS DE PRODUCTOS / continuación de interfaz | [Historia](stories/HU-15-categorias-productos.md) |
| HU-16 | [SMARLIST-20](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-20) | HU-16 · FILTRAR Y AGRUPAR POR CATEGORÍA | [Historia](stories/HU-16-filtrar-agrupar-categoria.md) |
| HU-17 | [SMARLIST-21](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-21) | HU-17 · BÚSQUEDA DE PRODUCTOS POR NOMBRE | [Historia](stories/HU-17-buscar-productos.md) |

Las historias HU-01 a HU-08, HU-10 a HU-17 y la continuación de HU-15 tienen padre SMARLIST-2 en la respuesta consultada. HU-09 no informó padre. SMARLIST-19 y SMARLIST-22 tienen un enlace Jira «Relates»; la descripción de SMARLIST-22 declara que continúa los criterios de interfaz de SMARLIST-19. Las dependencias HU-15 → HU-14 y HU-16 → HU-15 proceden de las descripciones, no de enlaces «Blocks» inferidos.

## 3. Discrepancias y decisiones de documentación

### D-01. HU-09 local frente a HU-10 en Jira

- **Evidencia:** [001-consultar-productos](../specs/001-consultar-productos/spec.md) se titula «HU-09 — Consultar productos» y deja la clave Jira pendiente. [SMARLIST-10](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-10) es HU-09 de mejora visual; [SMARLIST-11](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-11) es HU-10 de consulta.
- **Tratamiento:** requirements, stories, README y arquitectura usan la correspondencia de Jira. La ruta y el contenido histórico de specs se conservan; sus menciones HU-09 de consulta se interpretan con esta advertencia.
- **Pendiente:** no se encontró una especificación dedicada a la HU-09 visual ni specs dedicadas a HU-01 a HU-08; no se crean rutas ficticias. Su existencia fuera del repositorio queda pendiente de verificar.

### D-02. HU-12: título de edición, descripción de cambio de estado

- **Evidencia:** [SMARLIST-13](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-13) se titula «HU-12 · EDICIÓN DE PRODUCTOS», pero su descripción y los siete criterios exigen PATCH de purchased. [003-edicion-productos](../specs/003-edicion-productos/spec.md) exige PUT de nombre y cantidad y excluye PATCH. [HU-14 en Jira](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-15) distingue PUT (criterio 3) y PATCH (criterio 4), como [005-integracion-full-stack](../specs/005-integracion-full-stack/spec.md) y las [rutas implementadas](../backend/src/routes/productRoutes.js).
- **Tratamiento:** RF-11 conserva PUT con respaldo de la especificación y HU-14; RF-12 documenta PATCH con respaldo de la descripción Jira y HU-14. La historia HU-12 separa los criterios Jira de los CA-SPEC locales.
- **Pendiente de verificar:** el equipo debe reconciliar la descripción/identidad de SMARLIST-13. No se reemplazan sus criterios ni se inventa otra clave Jira.

### D-03. Modelo histórico de cuatro campos y categorías posteriores

- **Evidencia:** las primeras especificaciones definen cuatro atributos; [006-categorias-productos](../specs/006-categorias-productos/spec.md), [007-categorias-interfaz](../specs/007-categorias-interfaz/spec.md), el [esquema](../backend/database/schema.sql) y el [cliente API](../src/services/productsApi.js) incluyen category.
- **Tratamiento:** el contrato vigente tiene cinco atributos: id, name, quantity, purchased y category. La categoría es opcional en POST/PUT y obligatoria en los productos devueltos. Los bloques iniciales de specs y stories se mantienen como historia incremental, sin afirmar que prohíben la ampliación actual.
- **Evolución verificada:** SMARLIST-22 completa los criterios de interfaz diferidos en la especificación inicial de SMARLIST-19. [008-filtrar-agrupar-categoria](../specs/008-filtrar-agrupar-categoria/spec.md) completa la combinación con categoría que [004-busqueda-productos](../specs/004-busqueda-productos/spec.md) había pospuesto.

### D-04. localStorage sustituido por MySQL

- **Evidencia:** HU-07 describe persistencia local histórica. HU-14 exige recuperar desde MySQL; su especificación acuerda no importar automáticamente productos antiguos. El [hook actual](../src/hooks/useShoppingList.js) utiliza la API y no importa shoppingListStorage.
- **Tratamiento:** RF-07, RNF-06, RN-09 y alcance/restricciones reflejan MySQL. Las historias iniciales llevan una advertencia histórica. README y arquitectura distinguen las decisiones iniciales de la persistencia vigente.
- **Fuera de esta tarea:** [SMARLIST-26](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-26) propone retirar el módulo antiguo, con decisión previa del equipo. No se elimina ni se migra aquí.

### D-05. Orden de registro requerido frente al SQL de esta rama

- **Evidencia:** los filtros conservan el orden relativo y React agrega al final. Sin embargo, el [repositorio SQL](../backend/src/repositories/productRepository.js) consulta por BINARY id ASC. [SMARLIST-23](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-23) exige persistir el orden de registro y aparece «Listo» en Jira, pero el esquema de este checkout no contiene la secuencia de creación.
- **Tratamiento:** se distingue el requisito de orden de registro de la implementación observada. No se certifica que se conserve tras recargar en esta rama. La agrupación y los filtros conservan el orden recibido, lo cual no corrige el orden de la API.
- **Pendiente:** comprobar la incorporación de la corrección correspondiente al integrar ramas. Esta tarea no cambia consultas ni incorpora cambios de otra rama.

### D-06. Estado de Jira y contenido de este checkout

[SMARLIST-24](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-24) aparece «Listo», pero no hay workflow CI en la base de esta rama. No se traslada documentación de CI ni se afirma que esté activo. No se infiere la situación de otras ramas a partir de esta inspección. El estado de Jira se usa como evidencia de gestión, no como prueba de merge o de validación técnica.

### D-07. Descripción de HU-07 no devuelta por Jira

Tanto la consulta del proyecto como la lectura directa de SMARLIST-8 con campos summary y description devolvieron el título y la clave, sin descripción. Se verifica su identidad, pero los criterios históricos de HU-07 se conservan desde docs/stories y no se presentan como criterios recuperados de Jira en esta revisión. La persistencia vigente sí está respaldada por HU-10, HU-14, sus especificaciones y el código.

## 4. Fuentes y límites de validación

- [Requisitos y matriz global](requirements.md): RF-01 a RF-18; HU-09 se vincula a RNF-01 y RNF-02 para no duplicarlos.
- [Arquitectura](architecture.md) y [README](../README.md): comportamiento actual y contexto histórico.
- Las nueve especificaciones de specs se enlazan desde la matriz y las historias correspondientes; sus identificadores FR son locales a cada carpeta, no equivalentes a los RF globales.
- Se comprueba documentación y correspondencia estática con el código. No se certifican aceptación funcional, diseño visual, estado de despliegue ni ejecución remota de CI.
- Jira se consultó exclusivamente en lectura. No se cambiaron tickets, estados, comentarios o relaciones.
