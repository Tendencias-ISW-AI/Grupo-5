# Requisitos de SmartList

## Contexto y objetivo

Aplicación educativa pequeña, funcional, modular y fácil de mantener para gestionar listas de compras. Codex, Jira y GitHub forman parte del proceso académico; su integración no se solicita en esta configuración.

## Requisitos funcionales conocidos

- La aplicación estará orientada a gestionar listas de compras.
- Existe una historia inicial titulada HU-01: agregar producto, cuyos detalles y criterios están pendientes.
- Se contempla persistencia futura mediante localStorage; su comportamiento aún no está definido.

No se han definido otras operaciones, campos, validaciones o reglas de negocio. No se implementan funcionalidades de historias en esta entrega.

## Requisitos no funcionales y restricciones

- React con Vite, JavaScript/JSX y CSS convencional.
- npm para dependencias y Vitest para pruebas automatizadas.
- Componentes funcionales, responsabilidades separadas y código legible.
- Sin TypeScript, backend, base de datos externa, autenticación ni librerías innecesarias.
- Conservar los archivos relevantes y justificar cambios en configuraciones existentes.
- No modificar el historial Git ni realizar commits automáticamente.

## Alcance verificable de la configuración inicial

- Instalar las dependencias y preparar comandos de desarrollo, compilación, vista previa y pruebas.
- Iniciar y compilar una aplicación React mínima.
- Preparar componentes y hook sin lógica de negocio.
- Mantener documentación consistente y una prueba básica ejecutable.

## Supuestos y cuestiones abiertas

- La prueba solicitada se ubica en `tests/shoppingList.test.js`.
- El modelo provisional de presentación usa `id` y `name`; deberá revisarse al definir HU-01.
- Faltan criterios de aceptación, campos y validaciones de HU-01, y reglas para la persistencia futura.
