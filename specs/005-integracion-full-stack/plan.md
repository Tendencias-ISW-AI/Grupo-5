# Implementation Plan: SMARLIST-15 / HU-14 — Integración Full Stack

**Branch**: feature/SMARLIST-15-hu-14-integracion-full-stack | **Date**: 2026-10-14 | **Spec**: [spec.md](spec.md)

## Summary
Agregar PATCH en las capas existentes y conectar React con los cinco endpoints mediante fetch. Colección confirmada por API como único estado de productos; filtros y resumen derivados. Sin migración ni eliminación de datos locales históricos.

## Technical Context
**Language/Version**: JavaScript ES Modules, Node.js 22.14, JSX.
**Primary Dependencies**: React, Vite, Express, mysql2/promise existentes; ninguna nueva.
**Storage**: MySQL local smartlist_db.products, esquema sin cambios.
**Testing**: Vitest, jsdom, Supertest, MySQL real y navegador si disponible.
**Target Platform**: Navegador escritorio/móvil y Node local.
**Project Type**: Aplicación web frontend raíz/backend separado.
**Performance Goals**: Interfaz actualizada tras confirmación HTTP; sin objetivos de latencia no solicitados.
**Constraints**: Sin secretos Vite, optimismo, dependencias, cambios de rama ni datos ajenos.
**Scale/Scope**: Lista educativa, cinco operaciones REST, cobertura previa conservada.

## Constitution Check
Los siete principios pasan antes y después del diseño: capas, SDD autorizado, validación/SQL parametrizado, pruebas/regresiones, modelo compatible, simplicidad y trazabilidad. PATCH e integración están expresamente autorizados. Sin cambio de Constitution.

## Project Structure
### Documentation (this feature)
Specifications en specs/005-integracion-full-stack: spec.md, plan.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md, tasks.md, checklists/requirements.md y validation.md final.
### Source Code
Backend reutiliza backend/src/{routes,controllers,services,repositories}/product*.js. Añadir backend/tests/productStatus.test.js y productStatus.mysql.test.js.
Frontend añade src/services/productsApi.js; adapta src/hooks/useShoppingList.js, src/components/{ShoppingForm,ShoppingItem,ShoppingList}.jsx, src/App.jsx y App.css. Tests shoppingList.test.js, productsApi.test.js, fullStack.test.js y helpers/productsServer.js. Configuración pública .env.example.
**Structure Decision**: Reutilizar componentes y capas. Auxiliar privado comparte transacción de PUT/PATCH con SQL constante, SELECT FOR UPDATE y parámetros; permite mismo estado 200 y ausencia 404.

## Diseño
- Servicio fetch con URL pública configurable, validación de respuestas, errores seguros y DELETE 204 sin JSON.
- Carga cancelable con AbortController y generación de montaje para respuestas obsoletas/StrictMode. Sin mutaciones antes de cargar.
- Cola global de escrituras: leer colección vigente al ejecutar; PATCH calcula booleano deseado entonces. Bloquear controles mientras se confirma. Sin reintentos automáticos.
- Formularios esperan respuesta, conservan errores/borradores al fallar; limpian/cierran solo tras éxito. Filtro puede descartar borrador sin guardar como antes.
- Diferenciar carga, fallo y lista realmente vacía. Sin sistema complejo de notificaciones.
- shoppingListStorage.js se conserva solo como utilidad histórica probada, sin importación de producción.
- Adaptar los 111 casos anteriores a asincronía/servidor simulado conservando CRUD, validaciones, filtros, resumen, inmutabilidad y recuperación. Los datos locales corruptos no se migran ni sobrescriben.

## Complexity Tracking
Sin infracciones ni capas adicionales. Cola/cancelación necesarias para concurrencia, sin colección redundante.
