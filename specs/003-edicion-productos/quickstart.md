# Quickstart — SMARLIST-13 / HU-12

Reutilizar MySQL local, backend/.env y tabla products existente InnoDB sin triggers transformadores. No DDL. Desde backend/: npm test,npm run test:mysql,npm start.

Registrar fixture identificable con POST JSON {"name":"Arroz","quantity":2}; guardar ID. PUT /api/products/ID con {"name":"  Arroz integral  ","quantity":3}:200 modelo exacto con mismoID/purchased. GET lo recupera. Repetir mismos valores:200. Nombre vacío o quantity string:400; ID bien formado inexistente:404. id/purchased/campo extra en cuerpo:400. Indisponibilidad:503 seguro.

Usar suites automatizadas para pruebas reales: limpian exclusivamente sus IDs y preservan colección inicial, comprueban ambos estados y reinicio. No editar productos ajenos ni dejar fixtures manuales. La API no ofrece eliminación o cambio de estado.

Raíz: npm test y npm run build;111 casos frontend conservados. No modificar React o localStorage. Contrato en contracts/products.openapi.yaml y evidencia en validation.md al finalizar.
