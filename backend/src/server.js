import app from './app.js';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un puerto válido.');
}

const server = app.listen(port, () => {
  console.log(`SmartList backend disponible en http://localhost:${port}`);
});
server.on('error', (error) => {
  console.error(`No se pudo iniciar el servidor: ${error.code ?? 'error'}`);
  process.exitCode = 1;
});
