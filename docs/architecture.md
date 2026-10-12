# Arquitectura de software — SmartList

## 1. Introducción

Este documento describe la arquitectura técnica de SmartList, una aplicación web educativa para gestionar listas de compras.

Su propósito es establecer la organización del código, la distribución de responsabilidades, el modelo de datos y las decisiones técnicas que orientarán el desarrollo incremental de las historias de usuario.

La implementación debe respetar los requisitos definidos en `docs/requirements.md` y las instrucciones de `AGENTS.md`.

## 2. Estilo arquitectónico

SmartList utilizará una arquitectura frontend basada en componentes de React, organizada por responsabilidades técnicas.

La aplicación será una Single Page Application (SPA), donde la interfaz y el estado se actualizan dinámicamente sin requerir recargas completas de la página durante las operaciones habituales.

Se adopta una estructura modular sencilla, sin implementar Clean Architecture, microservicios ni una arquitectura de múltiples capas.

### Justificación

El alcance de SmartList es reducido y no requiere procesamiento en servidor ni integraciones externas.

La separación de componentes y lógica permite mantener un código comprensible, reutilizable y fácil de probar, evitando complejidad innecesaria.

## 3. Tecnologías

| Tecnología | Responsabilidad |
|---|---|
| React | Construcción y actualización de la interfaz |
| Vite | Entorno de desarrollo y compilación |
| JavaScript | Lógica de la aplicación |
| CSS | Presentación y diseño adaptable |
| React Hooks | Gestión del estado y comportamiento |
| localStorage | Persistencia de datos del navegador |
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
│   │   └── ShoppingFilters.jsx
│   ├── hooks/
│   │   └── useShoppingList.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
└── tests/
    └── shoppingList.test.js
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

Se implementará en HU-06.

### 5.6. ShoppingSummary.jsx

Componente encargado de mostrar los indicadores de la lista.

Responsabilidades:

- Mostrar total de productos.
- Mostrar productos pendientes.
- Mostrar productos comprados.

Se implementará en HU-08.

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

No se requiere un modelo relacional ni una base de datos externa.

## 8. Flujo de información

El flujo seguirá el patrón de datos unidireccional de React.

### Registro de productos

1. El usuario ingresa nombre y cantidad en `ShoppingForm`.
2. El formulario valida los datos.
3. Si son válidos, comunica la solicitud de registro.
4. `useShoppingList` crea un producto con identificador único y estado pendiente.
5. React actualiza el estado de la lista.
6. `ShoppingList` refleja el nuevo producto.
7. El formulario limpia los campos tras confirmar el registro.

### Otras operaciones

Las acciones de edición, eliminación y cambio de estado serán notificadas desde la interfaz y procesadas por las funciones correspondientes del hook.

Los componentes recibirán los datos actualizados a través de las propiedades de React.

## 9. Persistencia

La persistencia de HU-07 utiliza `localStorage` bajo la clave `smartlist.products`. El módulo `src/utils/shoppingListStorage.js` encapsula lectura, validación y escritura de un arreglo JSON.

### Comportamiento esperado

- Recuperar los productos almacenados al inicializar la aplicación.
- Guardar los cambios en la lista.
- Mantener identificadores, nombres, cantidades y estados.
- Gestionar errores de lectura, escritura y datos inválidos.
- Inicializar una lista vacía cuando no existan datos válidos.

El hook recupera los datos mediante inicialización diferida de `useState`. React mantiene la única colección vigente. Un efecto dependiente de `items` guarda cambios confirmados; una referencia a la colección anterior evita escrituras durante el montaje, también bajo StrictMode. Las operaciones existentes conservan sus contratos. El estado del filtro y los borradores locales no se almacenan.

La recuperación exige los cuatro atributos del modelo, IDs string no vacíos y únicos, nombres string no vacíos, cantidades numéricas enteras positivas y estados booleanos. No convierte tipos ni genera IDs; conserva los valores y el orden válidos. Si un registro falla, se rechaza la colección completa.

Sin clave se inicia vacío. JSON corrupto o estructura inválida inicia vacío sin sobrescribir en el montaje; una modificación válida confirmada sustituye el contenido previo. Fallos de acceso o lectura deshabilitan escrituras durante esa sesión. Fallos de escritura mantienen el estado en memoria y se reintentan en el próximo cambio confirmado. No se muestra un aviso visual ni se implementa sincronización entre pestañas. El almacenamiento está limitado al navegador y origen utilizados.

El almacenamiento local no se considerará un mecanismo de sincronización entre dispositivos.

Antes de HU-07, la lista podrá funcionar únicamente en memoria.

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

`validateProduct`, exportada desde `useShoppingList.js`, comparte las reglas de nombre y cantidad entre el formulario y el hook. `addProduct(name, quantity)` devuelve `{ success, errors }`; el formulario limpia sus campos únicamente cuando `success` es `true`. El identificador se genera con `crypto.randomUUID()` en navegadores modernos mediante localhost o HTTPS. HU-07 sincroniza los cambios confirmados con localStorage cuando la lectura inicial permite escrituras.

## 12. Decisiones arquitectónicas

HU-06 mantiene `activeFilter` en `App`, inicialmente `all`, con opciones `pending` y `purchased`. La colección visible se deriva mediante `filter` en cada render, sin otro estado de productos ni cambios en el hook. `ShoppingFilters` comunica la selección con botones y `aria-pressed`; `ShoppingList` recibe un mensaje vacío configurable. Si la colección original está vacía se conserva el mensaje original; si contiene registros sin coincidencias se utiliza el mensaje del filtro. Ocultar un producto desmonta su formulario y descarta cualquier borrador sin guardar.

HU-05 utiliza un formulario local en `ShoppingItem`, con borradores de nombre y cantidad separados del estado de la lista. Cancelar descarta el borrador; Guardar utiliza `updateProduct(id, data)`, que devuelve `{ success, errors }`. Se reutiliza `validateProduct` en interfaz y hook sin modificar el formulario de registro. Solo se actualizan `name` y `quantity`; el ID y el estado de compra se conservan desde el producto vigente. Los campos de edición utilizan `useId` para sus etiquetas y errores accesibles.

### DA-01. Aplicación frontend sin backend

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

### DA-05. Persistencia mediante localStorage

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
