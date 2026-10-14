# Research — SMARLIST-22

## R-01. Origen de la lista en el frontend

- **Decision**: Constante en `src/utils/productCategories.js` + prueba que la compara con `backend/src/services/productCategories.js`.
- **Rationale**: La lista es fija y pequeña; evita una petición extra y un endpoint no pedido. La prueba detecta cualquier desincronización.
- **Alternatives considered**: `GET /api/categories` (cambio de backend fuera de alcance); importar el módulo del backend desde React (acopla el bundle del frontend al directorio del backend).

## R-02. Control de selección

- **Decision**: `<select>` nativo con `<label>`.
- **Rationale**: Accesible por teclado y lector de pantalla sin dependencias; con 8 opciones no requiere búsqueda.
- **Alternatives considered**: botones/chips (ocupan más espacio en móvil); input libre (permite valores inválidos).

## R-03. Validación de respuestas

- **Decision**: `productsApi` exige `category` válida y exactamente cinco atributos.
- **Rationale**: Con SMARLIST-19 la API siempre devuelve `category`; aceptar productos sin ella ocultaría errores del servidor.
- **Alternatives considered**: mantener la tolerancia a cuatro atributos de PR #18 (útil solo durante la transición).

## R-04. Servidor simulado en pruebas

- **Decision**: El mock asigna `Otros` cuando no se envía `category`, igual que la API.
- **Rationale**: Las pruebas existentes siguen ejercitando los mismos flujos con la forma real del producto.
