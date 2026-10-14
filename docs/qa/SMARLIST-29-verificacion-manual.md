# SMARLIST-29 · Verificación manual en móvil y accesibilidad

Fecha: 2026-10-14. Ticket: [SMARLIST-29](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-29). Rama: `feature/SMARTLIST-29-qa-movil-accesibilidad`.

## Entorno

- Frontend con `npx vite` (Vite 7, React 19) sobre `main`.
- Chromium (Playwright) en modo dispositivo con anchos de 360, 375 y 414 px y 800 px de alto.
- La API se simuló con tres productos, uno de ellos con un nombre largo (`Leche deslactosada entera de larga duración`), para forzar el caso más desfavorable de ancho.

## Resultados por criterio de aceptación

| # | Criterio | Resultado | Evidencia |
|---|---|---|---|
| 1 | Sin desbordamiento horizontal a 360–414 px en formulario, búsqueda, filtros, vista agrupada y productos | **Cumple**. `scrollWidth` igual al ancho del viewport en 360, 375 y 414 px, con lista normal y agrupada; ningún elemento sobrepasa el borde derecho. | [lista-360](capturas/lista-360.png), [agrupado-360](capturas/agrupado-360.png), [lista-414](capturas/lista-414.png), [agrupado-414](capturas/agrupado-414.png) |
| 2 | Controles nuevos usables solo con teclado y con foco visible | **Cumple**. Con Tab se recorren, en orden lógico: nombre, cantidad, categoría, Agregar, búsqueda, Todos/Pendientes/Comprados, filtro de categoría, Agrupar por categoría y, en cada producto, checkbox, Editar y Eliminar. Todos son elementos nativos (`button`, `input`, `select`), así que Enter, Espacio y flechas funcionan. El foco se muestra con el contorno por defecto del navegador. | Recorrido de Tab registrado más abajo |
| 3 | Encabezados de grupo, etiquetas y mensajes de estado se anuncian correctamente | **Cumple con una observación**. Árbol de accesibilidad: `h1` SmartList, `h2` Resumen de compras y Lista de compras, región «Resumen de compras», `search`, grupo «Filtrar productos por estado» con `aria-pressed`, «Agrupar por categoría» con `aria-pressed`, lista con nombre accesible, checkbox «Comprado: <producto>» y botones «Editar/Eliminar <producto>». Carga y lista vacía usan `role="status"`. Observación: ver H-01. | Árbol de accesibilidad (Playwright `ariaSnapshot`) |
| 4 | Problemas encontrados corregidos o registrados como bugs en Jira | **Pendiente de registrar** H-01 y H-02 en Jira (ver abajo). | — |

## Hallazgos

- **H-01 (accesibilidad, menor):** hay dos combobox con el mismo nombre accesible, «Categoría»: el del formulario de registro y el del filtro. Un lector de pantalla los anuncia igual al navegar por controles de formulario. Propuesta: renombrar el del filtro a «Filtrar por categoría» (o añadirle un `aria-label`). Registrar como BUG en Jira.
- **H-02 (accesibilidad, menor):** no hay estilos propios de `:focus-visible`; el foco depende del contorno por defecto del navegador, que es visible en Chromium pero puede quedar poco contrastado sobre los botones de color. Propuesta: añadir en `App.css` una regla `:focus-visible { outline: 3px solid …; outline-offset: 2px; }`. Registrar como mejora o BUG.

## Recorrido con Tab (360 px)

```
Nombre del producto → Cantidad → Categoría → Agregar producto → Buscar producto
→ Todos → Pendientes → Comprados → Categoría (filtro) → Agrupar por categoría
→ Comprado: <producto> → Editar <producto> → Eliminar <producto> → (siguiente producto…)
```

## Pendiente de completar por el equipo (subtareas manuales)

Estas comprobaciones necesitan hardware o software que no estaba disponible en la sesión automatizada:

- [ ] Abrir la aplicación en un teléfono real (misma red, `npx vite --host`) y repetir el criterio 1. Dispositivo: ________.
- [ ] Ejecutar Lighthouse → Accesibilidad en DevTools (modo dispositivo, 360 px) y anotar la puntuación: ____.
- [ ] Recorrer la aplicación con NVDA (Windows) o VoiceOver (macOS/iOS) y confirmar el criterio 3.
- [ ] Crear en Jira los bugs H-01 y H-02 y enlazarlos a SMARLIST-29.
