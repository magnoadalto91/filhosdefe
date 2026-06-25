import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './src/routes/auth.js'
import usuariosRoutes from './src/routes/usuarios.js';
import agregadoresRoutes from './src/routes/agregadores.js';
import musicasRoutes from './src/routes/musicas.js';
import ervasRoutes from './src/routes/ervas.js';
import banhosRoutes from './src/routes/banhos.js';
import entidadesRoutes from './src/routes/entidades.js';
import rotinasRoutes from './src/routes/rotinas.js';
import girasRoutes from './src/routes/giras.js';
import pushRoutes from './src/routes/push.js';
import notificacoesRoutes from './src/routes/notificacoes.js';
import publicacoesRoutes from './src/routes/publicacoes.js';
import documentosRoutes from './src/routes/documentos.js';
import cloudinaryRoutes from './src/routes/cloudinary.js';
import cronRoutes from './src/routes/cron.js'
import estoqueRoutes from './src/routes/estoque.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use((_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next() });

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Filhos de Fé API is running' });
});

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/agregadores', agregadoresRoutes);
app.use('/api/musicas', musicasRoutes);
app.use('/api/ervas', ervasRoutes);
app.use('/api/banhos', banhosRoutes);
app.use('/api/entidades', entidadesRoutes);
app.use('/api/rotinas', rotinasRoutes);
app.use('/api/giras', girasRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/notificacoes', notificacoesRoutes);
app.use('/api/publicacoes', publicacoesRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/cron', cronRoutes)
app.use('/api/estoque', estoqueRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

// Em desenvolvimento local, sobe o servidor normalmente
if (process.env.VERCEL !== '1') {
  const { startGirasReminderJob } = await import('./src/jobs/girasReminder.js');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startGirasReminderJob();
  });
}

export default app;
