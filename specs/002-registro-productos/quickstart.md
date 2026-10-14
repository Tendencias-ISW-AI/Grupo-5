# Quickstart — SMARLIST-12 / HU-11

Reutilizar backend/.env y MySQL local smartlist_db.products previamente preparado. No ejecutar DDL para esta historia ni publicar secretos. Desde backend ejecutar npm test, npm run test:mysql y npm start.

POST http://localhost:3000/api/products con Content-Type application/json y {"name":"  Arroz  ","quantity":2}:201 con UUID,name Arroz,quantity2,purchased false. GET /api/products:200 y el mismo producto. Nombre vacío, quantity string, campos id/purchased o cuerpo incorrecto:400 sin registro. Indisponibilidad:503 seguro.

Las pruebas reales crean registros identificables, limpian exclusivamente sus IDs y comprueban conservación de colección previa. Ejecutarlas solo sobre entorno local de práctica. Las suites MySQL se ejecutan secuencialmente para evitar interferencia entre sus snapshots. No dejar fixtures de verificaciones manuales.

Desde raíz: npm test (111 casos conservados) y npm run build. El h1 debe decir exactamente SmartList. Mantenimiento de título separado; no conectar React a la API ni modificar localStorage.
