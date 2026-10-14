export function errorHandler(error, _request, response, _next) {
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: { message: 'JSON inválido.' } });
  }
  if (error.code === 'PRODUCT_STORAGE_UNAVAILABLE') {
    return response.status(503).json({ error: 'Servicio temporalmente no disponible' });
  }
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
    ? error.status
    : 500;
  response.status(status).json({
    error: { message: status === 500 ? 'Error interno del servidor.' : error.message },
  });
}
