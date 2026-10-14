import './config/environment.js';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === frontendOrigin) return callback(null, true);
    const error = new Error('Origen no permitido.');
    error.status = 403;
    return callback(error);
  },
}));
app.use(express.json());

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use((_request, response) => {
  response.status(404).json({ error: { message: 'Ruta no encontrada.' } });
});
app.use(errorHandler);

export default app;
