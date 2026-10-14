# Quickstart — SMARLIST-14 / HU-13

Reutilizar backend/.env ysmartlist_db.products existente,sinDDL o credenciales públicas. Backend:npm test,npm run test:mysql,npm start. Raíz:npm test,npm run build.

Solo crear fixture identificable propio mediante POST;registrarID,pedir GET/PUT para comprobar contratos y DELETE /api/products/UUIDpropio:204,cuerpo vacío. GET no debe contenerlo. SegundoDELETE404;IDnoUUID400;indisponibilidad503 seguro. Reiniciar servidor y confirmar ausencia.

No usar productos anteriores delusuario como fixtures. Suites reales limpian exclusivamenteIDs propios y comparan colección/esquema antes/después. No TRUNCATE o DELETEabierto. No integraciónReact,softdelete orecuperación. Resultados reales envalidation.md alfinalizar.
