# Arquitectura de software — SmartList

## 1. Introducción

Este documento describe la arquitectura técnica de SmartList, una aplicación web educativa para gestionar listas de compras.

Su propósito es establecer la organización del código, la distribución de responsabilidades, el modelo de datos y las decisiones técnicas que orientarán el desarrollo incremental de las historias de usuario.

La implementación debe respetar los requisitos y las instrucciones aplicables. HU-01 a HU-08 conservan el contexto histórico; HU-14 / SMARLIST-15 autoriza la arquitectura vigente React → servicio HTTP → API por capas → MySQL. Las decisiones iniciales de persistencia local ya no están activas.

## 2. Estilo arquitectónico

SmartList utilizará una arquitectura frontend basada en componentes de React, organizada por responsabilidades técnicas.

La aplicación será una Single Page Application (SPA), donde la interfaz y el estado se actualizan dinámicamente sin requerir recargas completas de la página durante las operaciones habituales.

React mantiene componentes y hooks sencillos; el backend utiliza las capas descritas en la sección15. Sin Clean Architecture, microservicios ni capas adicionales.

### Justificación

El alcance sigue siendo reducido; la integración autorizada utiliza el backend existente para persistir productos sin añadir nuevas funcionalidades de negocio.

La separación de componentes y lógica permite mantener un código comprensible, reutilizable y fácil de probar, evitando complejidad innecesaria.

## 3. Tecnologías

| Tecnología | Responsabilidad |
|---|---|
| React | Construcción y actualización de la interfaz |
| Vite | Entorno de desarrollo y compilación |
| JavaScript | Lógica de la aplicación |
| CSS | Presentación y diseño adaptable |
| React Hooks | Gestión del estado y comportamiento |
| MySQL + API Express | Persistencia vigente de productos |
| Vitest | Pruebas automatizadas |

La implementación se realizará utilizando JavaScript con JSX, sin TypeScript.

## 4. Estructura del proyecto

```text
smartlist/
├── AGENTS.md
├── README.md
├── package.json
├── index.html
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   └── stories/
├── src/
│   ├── components/
│   │   ├── ShoppingForm.jsx
│   │   ├── ShoppingList.jsx
│   │   ├── ShoppingItem.jsx
│   │   ├── ShoppingSummary.jsx
│   │   ├── ShoppingFilters.jsx
│   │   └── ProductSearch.jsx
│   ├── hooks/
│   │   └── useShoppingList.js
│   ├── utils/
│   │   ├── shoppingListStorage.js
│   │   └── productFilters.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
└── tests/
    ├── shoppingList.test.js
    └── productSearch.test.js
```

Los componentes y archivos se crearán o completarán según las necesidades de cada historia de usuario.

Esta estructura representa la organización objetivo y no implica que todos los archivos estén implementados desde el inicio.

## 5. Responsabilidades de los componentes

### 5.1. App.jsx

Componente principal encargado de integrar los elementos de la aplicación.

Responsabilidades:

- Utilizar el hook `useShoppingList`.
- Compartir los datos y las operaciones necesarias con los componentes.
- Organizar la interfaz principal.
- Conectar formulario, listado, filtros y resumen.

No debe concentrar toda la lógica de gestión de productos.

### 5.2. ShoppingForm.jsx

Componente para registrar productos y, si resulta conveniente, reutilizar el formulario durante su edición.

Responsabilidades:

- Capturar nombre y cantidad.
- Validar los campos del formulario.
- Mostrar mensajes de error.
- Notificar al componente superior cuando los datos sean válidos.
- Limpiar los campos después de un registro exitoso.

### 5.3. ShoppingList.jsx

Componente encargado de representar la colección de productos.

Responsabilidades:

- Recibir los productos que deben visualizarse.
- Renderizar un componente `ShoppingItem` por producto.
- Mostrar mensajes cuando la lista esté vacía.

### 5.4. ShoppingItem.jsx

Componente que representa individualmente un producto.

Responsabilidades:

- Mostrar nombre, cantidad y estado.
- Presentar controles para las operaciones disponibles.
- Notificar acciones de edición, eliminación o cambio de estado.
- Reflejar visualmente si un producto está comprado.

### 5.5. ShoppingFilters.jsx

Componente que permitirá seleccionar el filtro de visualización.

Responsabilidades:

- Presentar las opciones Todos, Pendientes y Comprados.
- Notificar el filtro seleccionado.
- Identificar visualmente el filtro activo.

Implementado en HU-06.

### 5.5.1. ProductSearch.jsx

Componente de presentación de la búsqueda por nombre (HU-17).

Responsabilidades:

- Mostrar el campo controlado "Buscar producto" dentro de un landmark `role="search"`.
- Notificar cada cambio del texto al componente superior.
- Ofrecer "Limpiar búsqueda", deshabilitado sin texto, que vacía el campo y le devuelve el foco.

No filtra ni conoce los productos.

### 5.6. ShoppingSummary.jsx

Componente encargado de mostrar los indicadores de la lista.

Responsabilidades:

- Mostrar total de productos.
- Mostrar productos pendientes.
- Mostrar productos comprados.

Implementado en HU-08 como componente de presentación que recibe `total`, `pending` y `purchased`. Utiliza una sección identificada y una lista de descripción con etiquetas y valores.

## 6. Gestión del estado

La lógica principal se centralizará en el hook personalizado `useShoppingList`.

Este hook será responsable de administrar la colección de productos y proporcionar las operaciones necesarias para modificarla.

Operaciones previstas:

- `addProduct`: agregar un producto.
- `updateProduct`: modificar sus datos.
- `removeProduct`: eliminar un producto.
- `togglePurchased`: cambiar su estado de compra.

La implementación debe utilizar actualizaciones inmutables del estado de React.

El hook no debe contener elementos visuales ni renderizar componentes.

## 7. Modelo de datos

Cada producto tendrá la siguiente estructura lógica:

```javascript
{
  id: "identificador-unico",
  name: "Arroz",
  quantity: 2,
  purchased: false
}
```

### Descripción de atributos

| Atributo | Tipo | Descripción |
|---|---|---|
| id | string | Identificador único del producto |
| name | string | Nombre del producto |
| quantity | number | Cantidad entera positiva |
| purchased | boolean | Estado de compra |

### Reglas

- Cada producto debe tener un identificador único.
- El nombre no puede estar vacío ni contener solo espacios.
- La cantidad debe ser un entero mayor que cero.
- Los productos nuevos tendrán `purchased: false`.
- Se permiten productos con nombres repetidos.
- Las operaciones deben identificar los productos mediante `id`.

La tabla MySQL existente conserva estos cuatro atributos, sin cambios de esquema en HU-14.

## 8. Flujo de información

El flujo seguirá el patrón de datos unidireccional de React.

### Registro de productos

1. El usuario ingresa nombre y cantidad en `ShoppingForm`.
2. El formulario valida los datos.
3. Si son válidos, comunica la solicitud de registro.
4. `useShoppingList` solicita POST mediante `productsApi`; el servidor genera ID y estado pendiente.
5. React incorpora únicamente el producto confirmado por el servidor.
6. `ShoppingList` refleja el nuevo producto.
7. El formulario limpia los campos tras confirmar el registro.

### Otras operaciones

Las acciones de edición, eliminación y cambio de estado serán notificadas desde la interfaz y procesadas por las funciones correspondientes del hook.

Los componentes recibirán los datos actualizados a través de las propiedades de React.

## 9. Persistencia vigente — HU-14

MySQL es la única persistencia activa. `productsApi.js` centraliza fetch, URL pública VITE_API_BASE_URL, JSON, validación básica de respuestas y errores; DELETE204 no deserializa JSON. La API genera IDs y confirma los datos.

El hook carga mediante GET cancelable y protegido por generación de montaje. Distingue loading/ready/error y bloquea escrituras hasta cargar. Una cola global serializa mutaciones leyendo los productos confirmados vigentes al ejecutar; el checkbox envía el booleano deseado por PATCH. Los controles esperan confirmación y los fallos conservan colección/borradores. No hay actualización optimista ni reintentos automáticos.

No se lee, escribe, migra ni borra automáticamente la clave histórica smartlist.products. Esos datos no aparecen en la lista API. shoppingListStorage.js permanece como utilidad histórica con pruebas aisladas, sin importación de producción. Filtros, resumen y borradores no se persisten.

## 10. Validaciones y manejo de errores

Las validaciones deben respetar las reglas de negocio definidas en `docs/requirements.md`.

Se debe comprobar que:

- El nombre no esté vacío.
- El nombre no contenga únicamente espacios.
- La cantidad sea un número entero positivo.
- Las operaciones identifiquen correctamente cada producto.

Los errores de entrada deben comunicarse mediante mensajes comprensibles para el usuario.

Las operaciones de almacenamiento deben manejar fallos previsibles sin interrumpir toda la aplicación.

## 11. Estrategia de pruebas

Se utilizará Vitest para implementar pruebas automatizadas.

Las pruebas deberán cubrir principalmente:

- Registro y validación de productos.
- Actualización de productos.
- Eliminación.
- Cambio de estado.
- Filtrado.
- Cálculo de indicadores.
- Persistencia.

Cuando sea necesario verificar interacciones de componentes React, se podrá incorporar una herramienta de pruebas de interfaz, previa justificación.

Las pruebas se agregarán progresivamente con cada historia de usuario.

Para HU-01, Vitest utiliza jsdom (dependencia de desarrollo) y las APIs `createRoot` y `act` de React para probar el formulario, el hook y la actualización de la lista. Estas pruebas no sustituyen la verificación en navegador.

`validateProduct`, exportada desde `useShoppingList.js`, comparte validación del formulario y hook, alineada con límites MySQL: nombre válido/trim hasta150 caracteres Unicode y cantidad entre1 y2147483647. Las operaciones ahora devuelven Promise de `{ success, errors }`; limpiar/cerrar formulario solo tras éxito. El servidor genera UUID y confirma persistencia.

## 12. Decisiones arquitectónicas

HU-08 calcula los indicadores durante el render de `App` desde la colección completa `items`: longitud total y conteos por `purchased === false` o `purchased === true`. `quantity` no interviene. `ShoppingSummary` recibe los valores derivados, sin estado adicional, efectos o acceso al almacenamiento. El resumen es global e independiente de `visibleItems`; agregar, eliminar o alternar estado actualiza los indicadores, mientras editar nombre o cantidad no los altera. Los contadores no se almacenan ni cambian las políticas de HU-07.

HU-17 (SMARLIST-21) agrega `searchQuery` en `App`, junto a `activeFilter`, sin persistirlo ni modificar `useShoppingList`. `src/utils/productFilters.js` concentra el filtrado en funciones puras: `normalizeText` (NFD sin marcas diacríticas, minúsculas, espacios reducidos y recortados), `matchesStatus`, `matchesSearch` (coincidencia parcial literal con `includes`) y `filterProducts(items, { status, query })`, que exige todos los criterios y conserva orden y referencias. El filtrado de estado de HU-06 se trasladó a `matchesStatus` con las mismas condiciones. Para el futuro filtro de categoría (SMARLIST-20) basta con añadir `category` a los criterios y su predicado. Con productos registrados y una búsqueda sin coincidencias, el mensaje de búsqueda prevalece sobre los mensajes del filtro; con la colección vacía se conserva el mensaje original.

HU-06 mantiene `activeFilter` en `App`, inicialmente `all`, con opciones `pending` y `purchased`. La colección visible se deriva mediante `filter` en cada render, sin otro estado de productos ni cambios en el hook. `ShoppingFilters` comunica la selección con botones y `aria-pressed`; `ShoppingList` recibe un mensaje vacío configurable. Si la colección original está vacía se conserva el mensaje original; si contiene registros sin coincidencias se utiliza el mensaje del filtro. Ocultar un producto desmonta su formulario y descarta cualquier borrador sin guardar.

HU-05 utiliza un formulario local en `ShoppingItem`, con borradores de nombre y cantidad separados del estado de la lista. Cancelar descarta el borrador; Guardar utiliza `updateProduct(id, data)`, que devuelve `{ success, errors }`. Se reutiliza `validateProduct` en interfaz y hook sin modificar el formulario de registro. Solo se actualizan `name` y `quantity`; el ID y el estado de compra se conservan desde el producto vigente. Los campos de edición utilizan `useId` para sus etiquetas y errores accesibles.

### DA-01. Decisión histórica: aplicación frontend sin backend

**Decisión:** desarrollar SmartList completamente en el navegador.

**Justificación:** las funcionalidades no requieren procesamiento remoto ni colaboración entre usuarios.

**Consecuencia:** los datos estarán vinculados al almacenamiento del navegador.

### DA-02. React con Vite

**Decisión:** utilizar React para la interfaz y Vite como herramienta de desarrollo.

**Justificación:** facilita la construcción de componentes y permite mantener una configuración sencilla.

**Consecuencia:** el proyecto utilizará JavaScript, JSX y el ecosistema de herramientas de React.

### DA-03. Organización por responsabilidades

**Decisión:** separar componentes, hooks, documentación y pruebas.

**Justificación:** permite identificar fácilmente la responsabilidad de cada archivo.

**Consecuencia:** si el proyecto incorpora múltiples funcionalidades independientes, podría evaluarse una organización por características.

### DA-04. Estado centralizado en un hook

**Decisión:** utilizar `useShoppingList` para las operaciones de la lista.

**Justificación:** evita concentrar la lógica en los componentes visuales.

**Consecuencia:** los componentes deben recibir los datos y callbacks que necesitan, manteniendo un flujo de información claro.

### DA-05. Decisión histórica: persistencia mediante localStorage

**Decisión:** almacenar los productos en el navegador.

**Justificación:** evita la necesidad de un servidor o base de datos externa.

**Consecuencia:** no habrá sincronización entre navegadores o dispositivos, y los datos podrán perderse si se elimina el almacenamiento local.

## 13. Evolución de la arquitectura

La aplicación se desarrollará de forma incremental mediante historias de usuario.

Cada implementación deberá respetar la organización existente y modificar únicamente los elementos necesarios.

No se crearán capas, servicios o abstracciones adicionales de manera anticipada.

Los cambios arquitectónicos deberán justificarse con una necesidad concreta y reflejarse en este documento.

## 14. Relación con otros documentos

- `AGENTS.md`: instrucciones y restricciones de trabajo para Codex.
- `README.md`: presentación general del proyecto.
- `docs/requirements.md`: requisitos funcionales, no funcionales y reglas de negocio.
- `docs/stories/`: criterios de aceptación de cada historia de usuario.

En caso de contradicción entre documentos, se debe informar la inconsistencia antes de implementar cambios.

## 15. Ampliación autorizada: base técnica del backend

Las secciones anteriores describen el frontend y sus HU-01 a HU-08. El backend vive en `backend/`; la integración autorizada de HU-14 conecta React y sustituye la persistencia activa local por MySQL. Los requisitos originales permanecen como referencia del alcance anterior.

Arquitectura objetivo: Routes → Controllers → Services → Repositories → MySQL. Routes define endpoints; Controllers interpreta HTTP; Services aplica validaciones y reglas; Repositories ejecuta SQL parametrizado; Config concentra entorno y pool; Middleware gestiona errores transversales.

Configurado: Express en `src/app.js`, inicio separado en `src/server.js`, JSON, CORS restringido al origen configurado, 404 y errores JSON, y GET `/health` sin base de datos. MySQL utiliza `mysql2/promise` con pool diferido y comprobación explícita mediante `checkDatabaseConnection`. Dotenv carga únicamente el `.env` local de `backend/`, con variables existentes del proceso teniendo precedencia. Vitest y Supertest prueban HTTP; la configuración MySQL se prueba con mocks.

HU-09 implementa GET `/api/products` mediante `productRoutes` → `productController` → `productService` → `productRepository` → pool MySQL. El repositorio ejecuta SELECT de los cuatro campos, ordenado por `BINARY id ASC`; el servicio comprueba el modelo y convierte TINYINT 0/1 a booleano JSON sin mutar filas. El controlador devuelve un arreglo 200, incluido `[]`. El servicio identifica fallos conocidos de almacenamiento y el middleware responde 503 con `{"error":"Servicio temporalmente no disponible"}`; errores inesperados conservan el 500 genérico.

`database/schema.sql` define `smartlist_db.products`: id VARCHAR(36) PK, name VARCHAR(150), quantity INT positivo y purchased BOOLEAN con default FALSE; CHECK enforced protege sus dominios. `database/initialize.js` y `config/initializeDatabase.js` se ejecutan únicamente con `npm run db:init`, inspeccionan MySQL >= 8.0.16 y compatibilidad previa, y crean solo objetos faltantes. Ante incompatibilidad no alteran estructuras ni datos. GET, importaciones y arranque no inicializan el esquema. Los secretos permanecen en `.env` excluido de Git.

HU-11 / SMARLIST-12 agrega POST `/api/products` en las mismas capas. `createProduct` valida un objeto con exclusivamente name/quantity, normaliza nombre mediante trim, exige UTF-8 válido y hasta150 caracteres Unicode, y quantity entero numérico entre1 y2147483647. Genera UUID con `node:crypto`, establece purchased=false y llama `insertProduct`, que usa INSERT parametrizado y confirma una fila insertada antes de devolver201. Datos inválidos producen400 sin SQL; se comparte la clasificación de indisponibilidad del servicio y el manejo503/500 existente. JSON inválido produce400 genérico sin eco del payload.

El esquema no cambia. GET conserva contrato y orden; su comprobación de longitud de nombre cuenta caracteres Unicode como MySQL para recuperar nombres válidos de POST sin truncar. No se agregan estados, campos o capas. Los reintentos de POST no se deduplican.

HU-12 / SMARLIST-13 agrega PUT `/api/products/:id` en las capas existentes. POST y PUT comparten `validateProductData` local al servicio, sin modificar las reglas/mensajes de registro. El ID se valida como string bien formado de1..36 unidades UTF-16 sin espacios externos; cuerpo completo exclusivo name/quantity. Inválido400 antes deSQL, inexistente404 sin upsert y edición200 con cuatro atributos, id/purchased originales. Infraestructura conserva503/500.

`updateProductById` adquiere una conexión y transacción: SELECT por clave primaria FOR UPDATE, luego UPDATE parametrizado únicamente de name/quantity. Consulta vacía produce ausencia; una fila existente produce200 incluso con cero cambios. Se devuelve id/purchased de la fila bloqueada y los campos confirmados, evitando una tercera consulta bajo el esquema comprobado InnoDB sin triggers transformadores. Commit antes de responder; error produce rollback y release, y un rollback fallido destruye la conexión sin ocultar el error original. No hay reintentos automáticos o control optimista.

HU-13 / SMARLIST-14 agrega DELETE `/api/products/:id` en las mismas capas. Servicio comparte la validación básica de ID con PUT y exige adicionalmente UUID hexadecimal8-4-4-4-12 solo para DELETE, sin normalizar identidad o restringir versión. PUT mantiene sus reglas históricas. El repositorio ejecuta una sentencia parametrizada `DELETE FROM products WHERE id = ?`;0 filas produce404,1 confirma éxito y el controlador termina204 sin cuerpo. Errores400/404/503/500 reutilizan las convenciones existentes. La selección no depende de nombre,estado o cuerpo.

Es eliminación física, sin atributos nuevos,papelera o recuperación. Una sentencia InnoDB con autocommit vigente no necesita consulta previa o transacción adicional. GET/POST/PUT permanecen intactos salvo extracción mínima de validaciónID y error404 compartidos.

Las pruebas aisladas usan Vitest/Supertest con mocks; `npm run test:mysql` activa suites reales secuenciales con fixtures propios, limpieza por sus IDs y comparación de colección/esquema inicial y final, incluyendo GET/POST/PUT/DELETE HTTP y reinicio del proceso. Las pruebas nunca eliminan registros anteriores del usuario. HU-14 completa cambio de estado e integración React–API. LocalStorage histórico permanece intacto, sin uso activo. No hay ORM, migraciones, autenticación ni Docker.

Spec Kit 1.0.13 está inicializado en la raíz con integración oficial Codex, scripts Bash y habilidades `.agents/skills/speckit-*`. La Constitution v1.0.0 está aprobada. HU-09 conserva los artefactos del flujo SDD en `specs/001-consultar-productos`; las fases consecutivas fueron autorizadas expresamente sin cambios de rama. Las futuras funcionalidades siguen Specify → Clarify → Plan → Tasks → Analyze → Implement con revisión y aprobaciones aplicables. El AGENTS.md original se conserva y `backend/AGENTS.md` complementa las reglas de la ampliación.

## 16. HU-14 / SMARLIST-15: estado e integración

PATCH `/api/products/:id/status` reutiliza las capas vigentes y la validación UUID de DELETE. El servicio exige un objeto exclusivo purchased booleano; inválidos400 antes de SQL, ausentes404, indisponibilidad503 segura. El repositorio comparte con PUT un auxiliar transaccional privado: SELECT FOR UPDATE y UPDATE purchased parametrizado con WHERE id. Mantiene otros atributos y devuelve200 incluso si el estado coincide. No modifica esquema ni contratos anteriores.

`App` presenta carga/error, conecta las operaciones asíncronas y conserva filtros y ShoppingSummary como valores derivados de items. Formularios conservan borradores tras rechazo; solicitudes en curso bloquean controles, sin perder confirmaciones si un filtro desmonta el formulario. React no genera IDs. La colección del estado y su referencia de lectura apuntan al mismo dato confirmado, sin segunda colección persistente.

Pruebas frontend utilizan API simulada independiente de localStorage, await act y respuestas copiadas. Conservan111 casos funcionales adaptados y añaden fallos/concurrencia/StrictMode. Backend mantiene pruebas aisladas y MySQL real con fixtures propios, incluyendo reinicio. Evidencia y cobertura en specs/005-integracion-full-stack/validation.md. Sin dependencias nuevas ni experiencia avanzada de reintentos/sincronización entre clientes.
