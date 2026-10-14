# Research — HU-14

1. **PATCH**: reutilizar transacción PUT con SELECT FOR UPDATE y UPDATE purchased parametrizado. Mismo estado 200, ausencia 404; cero cambios no implica ausencia.
2. **Autoridad**: API confirmada, sin optimismo ni UUID cliente. Sin respaldo local que oculte fallos o duplique registros.
3. **Concurrencia**: cola global de escrituras que lee datos vigentes al ejecutar. GET inicial cancelado/ignorado al desmontar; mutaciones solo tras carga correcta.
4. **Regresiones**: investigación de solo lectura confirma 111 casos. Mantenerlos con await act, servidor simulado independiente del almacenamiento local, respuestas copiadas y DELETE sin JSON.
5. **StrictMode**: ciclo adicional setup/cleanup; AbortController y generación protegen contra respuestas antiguas.

Fuentes primarias: [React act](https://react.dev/reference/react/act), [useEffect](https://react.dev/reference/react/useEffect), [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), [HTTP 204](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/204).

Sin dependencias nuevas. MySQL y navegador se validarán, sin asumir resultados históricos.
