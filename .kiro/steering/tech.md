---
inclusion: always
---

# SmartList: contexto técnico

Este archivo aporta contexto a Kiro. Las reglas operativas compartidas permanecen en `AGENTS.md` y `backend/AGENTS.md`; no se duplican ni se sustituyen aquí.

## Stack existente

- Frontend: React 19, Vite 7, JavaScript/JSX, ES Modules y CSS convencional.
- Backend: Node.js, Express 5, JavaScript/ES Modules, mysql2/promise, dotenv y cors.
- Entorno: Node.js >= 22.12.0 según backend/package.json y npm. Los manifests y lockfiles de raíz y backend son independientes y determinan las versiones efectivas.
- Pruebas: Vitest; jsdom y React act/createRoot en frontend; Supertest en backend. Las suites MySQL son opt-in y están separadas de las pruebas aisladas.
- Sin TypeScript, ORM, framework visual o biblioteca HTTP adicional. La arquitectura existente utiliza componentes/hooks en React y Routes → Controllers → Services → Repositories → MySQL en backend.

## Contratos y configuración

`src/services/productsApi.js` centraliza fetch. La URL pública usa `VITE_API_BASE_URL`, por defecto `http://localhost:3000/api`; el frontend local suele usar 5173. CORS y dotenv se configuran en backend, con credenciales únicamente en su entorno privado, nunca en Steering o variables Vite.

| Operación implementada | Respuesta de éxito |
|---|---|
| GET /api/products | 200, arreglo de productos, incluido [] |
| POST /api/products | 201, producto creado |
| PUT /api/products/:id | 200, producto editado |
| PATCH /api/products/:id/status | 200, producto con estado confirmado |
| DELETE /api/products/:id | 204 sin cuerpo |
| GET /health | 200, independiente de MySQL |

POST/PUT validan nombre y cantidad y aceptan categoría opcional. POST usa Otros por defecto; PUT sin categoría conserva la vigente. PATCH exige solo purchased booleano y comparte UUID con DELETE. PUT mantiene su validación histórica de ID string; no endurecer ese contrato por analogía. Infraestructura y validación reutilizan errores HTTP seguros.

`backend/database/schema.sql` declara `smartlist_db.products`, con cinco columnas y sus CHECK. Existe una migración de categoría en `backend/database/add-product-category.sql`. Los comandos de inicialización y las pruebas reales pueden escribir en MySQL: no ejecutarlos como efecto de abrir Kiro o cargar Steering.

## Comandos disponibles

| Directorio | Comandos |
|---|---|
| Raíz | npm run dev; npm test; npm run test:watch; npm run build; npm run preview |
| backend/ | npm start; npm run dev; npm test; npm run test:watch |
| backend/, solo cuando el alcance lo autorice | npm run db:init; npm run test:mysql |

Las verificaciones deben declarar sus resultados reales. Los informes históricos en specs/ son evidencia de ejecuciones anteriores, no resultados de la sesión actual.

## Gobernanza SDD compartida

La Constitution v1.0.0 sigue vigente para el backend y se referencia directamente para evitar una copia divergente:

#[[file:.specify/memory/constitution.md]]

El backend exige Specify → Clarify → Plan → Tasks → Analyze → Implement y las habilidades oficiales según sus instrucciones existentes. Preparar Steering no cambia ese requisito. Una futura adopción exclusiva de Specs de Kiro para historias backend requiere acordar y aprobar la adaptación de gobernanza; no asumir equivalencia automática ni afirmar que se ejecutaron habilidades Spec Kit desde Kiro.

Las primeras Specs nativas pueden abordar mejoras aisladas de frontend, con requisitos/diseño/tareas revisados antes de implementar. Las autorizaciones y restricciones de AGENTS siguen aplicándose.
