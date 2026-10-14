import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Configuración inicial de Express', () => {
  it('inicializa una aplicación sin abrir puertos ni conectar MySQL', () => {
    expect(typeof app).toBe('function');
    expect(typeof app.listen).toBe('function');
  });

  it('GET /health devuelve 200 y JSON de disponibilidad', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('una ruta inexistente devuelve 404', async () => {
    const response = await request(app).get('/products');
    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe('Ruta no encontrada.');
  });

  it('permite el origen configurado del frontend', async () => {
    const origin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
    const response = await request(app).get('/health').set('Origin', origin);
    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
  });

  it('rechaza un origen distinto', async () => {
    const response = await request(app).get('/health').set('Origin', 'https://otro-origen.invalid');
    expect(response.status).toBe(403);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('devuelve un error controlado ante JSON malformado', async () => {
    const response = await request(app).post('/health').set('Content-Type', 'application/json').send('{');
    expect(response.status).toBe(400);
    expect(response.body.error.message).toEqual(expect.any(String));
  });
});
