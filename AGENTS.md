
# AGENTS.md — SmartList

## 1. Contexto del proyecto

SmartList es una aplicación web educativa para gestionar
listas de compras.

El proyecto tiene como objetivo practicar el desarrollo de
software asistido por inteligencia artificial mediante Codex,
la gestión de historias de usuario en Jira y el control de
versiones con Git y GitHub.

La aplicación debe permitir registrar, visualizar, editar,
eliminar y marcar productos como comprados, además de filtrar
la lista, mostrar un resumen y conservar la información
localmente.

El desarrollo se realizará de manera incremental, siguiendo
las historias de usuario definidas en Jira.

## 2. Stack tecnológico

- Frontend: React con Vite.
- Lenguaje: JavaScript (JSX).
- Estilos: CSS.
- Persistencia: localStorage.
- Pruebas: Vitest.
- Dependencias: npm.
- Control de versiones: Git y GitHub.
- Gestión del proyecto: Jira.

No incorporar backend, bases de datos externas, autenticación
ni nuevas dependencias sin una justificación y autorización.

## 3. Principios de desarrollo

- Priorizar soluciones sencillas y fáciles de mantener.
- Utilizar componentes funcionales de React.
- Separar la presentación de la lógica de negocio.
- Crear componentes reutilizables cuando sea necesario.
- Utilizar nombres descriptivos para variables y funciones.
- Evitar código duplicado y abstracciones innecesarias.
- Respetar la estructura existente del proyecto.
- No modificar funcionalidades ajenas a la tarea solicitada.
- No introducir TypeScript.

## 4. Organización del proyecto

La estructura principal será:

- src/components/: componentes de interfaz.
- src/hooks/: hooks y lógica reutilizable.
- src/App.jsx: composición principal de la aplicación.
- src/App.css: estilos de la aplicación.
- tests/: pruebas automatizadas.
- docs/: documentación del proyecto.
- docs/stories/: especificaciones de historias de usuario.

Antes de crear nuevos archivos o carpetas, revisar si
existen componentes o funciones que puedan reutilizarse.

## 5. Documentación de referencia

Antes de implementar una funcionalidad, consultar:

1. docs/requirements.md:
   requisitos funcionales y no funcionales.

2. docs/architecture.md:
   arquitectura, componentes y decisiones técnicas.

3. docs/stories/:
   historia de usuario correspondiente a la tarea.

No asumir que todos los documentos existen desde el inicio.
Si falta alguno, informar la situación y trabajar únicamente
con el contexto disponible, sin inventar requisitos.

## 6. Flujo de trabajo con historias de usuario

Para cada historia de usuario:

1. Identificar su clave de Jira.
2. Leer la especificación correspondiente.
3. Revisar los criterios de aceptación.
4. Inspeccionar el código existente.
5. Presentar un plan breve de implementación.
6. Implementar únicamente la funcionalidad solicitada.
7. Crear o actualizar las pruebas necesarias.
8. Ejecutar las validaciones disponibles.
9. Informar los cambios realizados y sus resultados.

No comenzar otra historia de usuario sin una solicitud
explícita.

## 7. Calidad y pruebas

- Validar los datos introducidos por el usuario.
- Mostrar mensajes claros cuando existan errores.
- Mantener una interfaz adaptable a dispositivos móviles.
- Evitar errores que interrumpan el funcionamiento.
- Incorporar pruebas para la lógica implementada.
- Ejecutar las pruebas relacionadas con cada cambio.
- Verificar que la aplicación compile correctamente.

Si una prueba falla, identificar la causa y corregirla
cuando corresponda al alcance de la tarea.

No afirmar que una prueba pasó si no fue ejecutada.

## 8. Git y control de versiones

- Trabajar sobre la rama correspondiente a cada tarea.
- Utilizar nombres de ramas asociados a las claves de Jira.
- Seguir la convención Conventional Commits.
- No crear commits ni realizar push automáticamente.
- No modificar el historial de Git sin autorización.
- No cambiar de rama sin autorización.
- No incluir archivos temporales, secretos o dependencias
  instaladas en los commits.

Antes de finalizar una tarea, indicar qué archivos fueron
modificados y sugerir un mensaje de commit.

## 9. Gestión de cambios

- Respetar el alcance de la historia de usuario activa.
- No implementar funcionalidades futuras anticipadamente.
- Consultar antes de introducir dependencias adicionales.
- Evitar refactorizaciones que no estén relacionadas
  con la tarea.
- Mantener la documentación consistente con el código.
- Si una decisión contradice los requisitos existentes,
  informar el conflicto antes de implementarla.

## 10. Comunicación con el desarrollador

- Responder en español.
- Utilizar explicaciones técnicas claras y concisas.
- Explicar decisiones importantes de arquitectura.
- Informar errores, limitaciones y tareas pendientes.
- Indicar cómo comprobar manualmente cada funcionalidad.
- No asumir que una tarea está terminada sin verificar
  sus criterios de aceptación.

## 11. Criterios de finalización

Una tarea se considera completada cuando:

- Cumple los criterios de aceptación aplicables.
- Respeta los requisitos y la arquitectura existente.
- No introduce errores conocidos en otras funcionalidades.
- Las pruebas correspondientes fueron ejecutadas.
- La aplicación compila correctamente.
- Se informa el resultado de las validaciones.
- Los cambios quedan disponibles para revisión.
