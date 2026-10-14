# Comprobación HU-14

1. MySQL local smartlist_db.products; backend/.env privado configurado.
2. Backend: npm start (3000), npm test y npm run test:mysql.
3. Raíz: .env.example contiene VITE_API_BASE_URL=http://localhost:3000/api; npm run dev, npm test y npm run build.
4. Abrir localhost:5173: esperar carga, registrar fixture, editar, marcar/desmarcar, filtrar, resumen y recargar. Eliminar únicamente fixture propio y comprobar ausencia.
5. PATCH true/false/mismo valor 200; cuerpo/UUID inválido 400; inexistente 404; indisponibilidad 503 segura. DELETE 204 sin cuerpo.
6. Revisar escritorio/móvil, teclado y errores. Datos históricos locales no se leen, migran ni borran. Sin reintentos automáticos; recargar tras solucionar conexión.

Registrar resultados en validation.md, comprobar datos previos/esquema intactos al limpiar fixtures.
