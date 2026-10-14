export function errorHandler(error, _request, response, _next) {
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
    ? error.status
    : 500;
  response.status(status).json({
    error: { message: status === 500 ? 'Error interno del servidor.' : error.message },
  });
}
