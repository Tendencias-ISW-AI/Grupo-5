# Quickstart — HU-09

## Requisitos

Node.js compatible con el proyecto y MySQL local >= 8.0.16. Instalar dependencias existentes con npm ci en raíz y backend si faltan. Configurar backend/.env desde .env.example: localhost:3306, DB_USER=root para prácticas, DB_NAME=smartlist_db y contraseña exclusivamente local. Nunca versionar .env.

## Preparar y comprobar

Desde backend/:

```sh
npm run db:init
npm test
npm run test:mysql
npm start
```

db:init inspecciona estructuras y crea únicamente objetos faltantes de smartlist_db. Ante incompatibilidad se detiene sin ALTER/DROP. test:mysql requiere conexión real, genera fixtures exclusivos y elimina solo sus IDs; no utilizar contra información de producción.

Consultar http://localhost:3000/health (200 JSON sin depender de MySQL) y http://localhost:3000/api/products (200 arreglo, [] si no hay registros). Contrato en [products.openapi.yaml](contracts/products.openapi.yaml).

Verificar tres consultas iguales, orden, atributos y booleanos; reiniciar servidor y comparar colección. Ante indisponibilidad, 503 con {"error":"Servicio temporalmente no disponible"}; pruebas aisladas simulan fallo y recuperación sin detener MySQL.

En raíz ejecutar npm test y npm run build para regresión frontend. Registrar fallos preexistentes sin alterar React. HU-09 no proporciona endpoints de escritura ni conecta React a la API.
