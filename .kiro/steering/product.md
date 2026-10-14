---
inclusion: always
---

# SmartList: contexto del producto

SmartList es una aplicación educativa para gestionar una lista de compras. El desarrollo incremental utiliza historias de Jira y SDD; la IA asiste al equipo de desarrollo, no es una funcionalidad de la aplicación.

## Funcionalidades implementadas

- Registrar productos, consultar la lista y recuperar los datos al abrir o recargar.
- Editar nombre, cantidad y categoría; guardar o cancelar el borrador.
- Marcar/desmarcar productos como comprados y eliminarlos físicamente mediante la API.
- Filtrar por estado y categoría, y buscar parcialmente por nombre sin distinguir mayúsculas o diacríticos. Existe un botón para limpiar solo la búsqueda.
- Agrupar la vista por categoría, con pendientes de cada categoría calculados sobre la colección global.
- Mostrar total, pendientes y comprados de toda la colección, independientemente de la vista. El total cuenta registros, no la suma de cantidades.

## Datos y persistencia vigentes

El producto actual contiene `id: string`, `name: string`, `quantity: number`, `purchased: boolean` y `category: string`. La categoría es una extensión ya implementada, documentada en `specs/006-categorias-productos/` y `specs/007-categorias-interfaz/`.

Categorías admitidas: Frutas y verduras, Carnes y pescados, Lácteos, Panadería, Despensa, Bebidas, Aseo y Otros. Las listas canónicas están en `src/utils/productCategories.js` y `backend/src/services/productCategories.js`; consultar esos archivos antes de cambiarlas.

MySQL es la persistencia activa. React representa los productos confirmados por la API; el backend genera el ID y el estado inicial pendiente. Los nombres repetidos son registros independientes. Los datos históricos de localStorage no se leen, migran ni borran automáticamente. Búsqueda, filtros, agrupación y borradores son temporales.

La aplicación distingue carga, lista vacía y error. Una solicitud fallida conserva los datos confirmados y los campos del formulario; una carga fallida requiere solucionar la conexión y recargar. No hay reintentos avanzados ni sincronización en tiempo real entre clientes.

## Alcance

No hay autenticación, múltiples listas, colaboración entre usuarios, pagos o integración con supermercados. Una propuesta de mejora no constituye autorización para implementarla.

## Referencias

Consultar `README.md`, `docs/architecture.md`, `docs/requirements.md` y la historia específica antes de trabajar. Los requisitos iniciales y algunos párrafos históricos describen una etapa sin backend o un modelo de cuatro atributos; las ampliaciones posteriores y el código vigente documentan MySQL y categoría. Conservar el historial y comunicar cualquier contradicción que afecte una nueva historia.
