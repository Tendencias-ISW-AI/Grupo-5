# HU-12 — Edición de productos

## 1. Información general

| Campo | Valor |
|---|---|
| Proyecto | SmartList |
| Clave Jira | [SMARLIST-13](https://unbosque-team-tnlgzw1e.atlassian.net/browse/SMARLIST-13) |
| Título en Jira | HU-12 · EDICIÓN DE PRODUCTOS |
| Requisitos relacionados | RF-11 (PUT, especificación local y HU-14); RF-12 (PATCH, descripción Jira) |
| Épica | SMARLIST-2 |
| Verificación documental | 2026-10-14; no certifica aceptación funcional |

## 2. Historia de usuario según Jira

Como usuario, quiero actualizar el estado de compra de un producto, para distinguir los artículos pendientes de los que ya compré.

## 3. Criterios de aceptación según Jira

1. El backend debe exponer `PATCH /api/products/:id/status`.
2. Debe recibir el nuevo estado de compra como valor booleano.
3. Debe permitir marcar y desmarcar productos.
4. Debe conservar nombre, cantidad e identificador.
5. Debe guardar el nuevo estado en MySQL.
6. Si el producto no existe, debe devolver `404`.
7. Si el estado es inválido, debe devolver `400`.

## 4. Alcance vigente y contraste de fuentes

**Discrepancia sin resolver (D-02):** el título de Jira dice «EDICIÓN DE PRODUCTOS», pero su descripción y criterios exigen PATCH de estado. La especificación `003-edicion-productos` exige PUT de nombre y cantidad y excluye PATCH. El código implementa ambos endpoints y HU-14 los distingue. No se considera que PUT satisfaga los criterios PATCH de Jira, ni se corrige Jira en esta tarea.

## 5. Comportamiento de edición según la especificación local

Como usuario, quiero modificar nombre y cantidad de productos almacenados sin perder su identificador ni estado de compra.

- **CA-SPEC-01:** `PUT /api/products/:id` exige nombre y cantidad válidos, con las mismas validaciones del registro.
- **CA-SPEC-02:** modifica únicamente el producto indicado y conserva `id` y `purchased`; HU-15 agrega categoría editable opcional.
- **CA-SPEC-03:** devuelve 200 con el producto confirmado, incluso si los valores coinciden; inexistente devuelve 404 sin crear registros.
- **CA-SPEC-04:** entradas inválidas devuelven 400 sin modificación; los cambios persisten tras consultar o reiniciar.

Estos criterios proceden de `003-edicion-productos`, no de la descripción actual de SMARLIST-13. La asociación de PUT a HU-12 queda pendiente de reconciliación en Jira; también está respaldado por el criterio 3 de HU-14.

## 6. Referencias

- [Especificación 003-edicion-productos](../../specs/003-edicion-productos/spec.md).
- [Especificación 005-integracion-full-stack](../../specs/005-integracion-full-stack/spec.md).
- [Requisitos y matriz de trazabilidad](../requirements.md).
- [Discrepancias y procedencia](../documentation-traceability.md).
- [Arquitectura](../architecture.md).
