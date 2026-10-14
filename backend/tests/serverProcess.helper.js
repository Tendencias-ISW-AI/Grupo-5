import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';

// SMARLIST-27: margen común para que el proceso de la API inicie incluso en equipos lentos.
export const SERVER_START_TIMEOUT_MS = 15000;

export async function unusedPort() {
  const probe = createServer(); probe.listen(0, '127.0.0.1'); await once(probe, 'listening');
  const port = probe.address().port; await new Promise(resolve => probe.close(resolve)); return port;
}

async function waitUntilAvailable(child) {
  await new Promise((resolve, reject) => {
    const finish = callback => value => { clearTimeout(timer); callback(value); };
    const timer = setTimeout(() => reject(new Error(
      `Servidor de prueba no disponible tras ${SERVER_START_TIMEOUT_MS} ms`)), SERVER_START_TIMEOUT_MS);
    child.once('error', finish(() => reject(new Error('No se pudo iniciar el proceso de prueba'))));
    child.once('exit', finish(() => reject(new Error('El proceso terminó antes de estar disponible'))));
    let output = '';
    child.stdout.on('data', data => { output += data.toString(); if (output.includes('disponible')) finish(resolve)(); });
  });
}

// Inicia src/server.js en un proceso nuevo, ejecuta callback(origin) y siempre detiene el proceso.
export async function withServerProcess(callback, { port } = {}) {
  const selectedPort = port ?? await unusedPort();
  const child = spawn(process.execPath, ['src/server.js'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)), env: { ...process.env, PORT: String(selectedPort) },
    windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'],
  });
  try {
    await waitUntilAvailable(child);
    return await callback(`http://127.0.0.1:${selectedPort}`);
  } finally {
    if (child.exitCode === null && child.signalCode === null) { const exited = once(child, 'exit'); child.kill(); await exited; }
  }
}
