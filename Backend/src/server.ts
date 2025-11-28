// src/server.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// ── All existing routes ─────────────────────
import indexRouter from './routes/index';
import authRoutes from './routes/authRoutes';
import familyRoutes from './routes/familyroutes';           // your working route
import caseReporterRoutes from './routes/caseReporterRoutes';

// ── New routes from the other branch ────────
import visitsRoutes from './routes/visitsRoutes';
import volunteerRoutes from './routes/volunteerRoutes';
import userRoutes from './routes/UserRoutes';

// ── NEW: Awareness module ───────────────────
import adminRoutes from './routes/adminRoutes';             // Admin panel (protected)
import awarenessRoutes from './routes/awarenessRoutes';     // Public content

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files (photos, documents, etc.)
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ── Route mounting (in logical order) ───────
app.use('/', indexRouter);

app.use('/api/auth', authRoutes);
app.use('/api/auth/families', familyRoutes);        // fixed & kept your working path
app.use('/case', caseReporterRoutes);

app.use('/visits', visitsRoutes);
app.use('/volunteer', volunteerRoutes);
app.use('/user', userRoutes);
app.use('/availability', userRoutes);              // you had this twice → kept it

// ── Awareness Module Routes ─────────────────
app.use('/api/admin', adminRoutes);                // Admin-only routes
app.use('/api/awareness', awarenessRoutes);        // Public articles, videos, etc.

// ── 404 Handler ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableEndpoints: [
      'POST   /api/auth/register',
      'POST   /api/auth/login',
      'POST   /api/families/enroll',
      'GET    /api/awareness/articles',
      'GET    /case/reports',
      'GET    /uploads/... (photos)'
    ]
  });
});

// ── Start Server ────────────────────────────
app.listen(PORT, () => {
  console.log(`ChildGuard Backend LIVE → http://localhost:${PORT}`);
  console.log(`Static uploads → http://localhost:${PORT}/uploads`);
  console.log(`Public awareness → http://localhost:${PORT}/api/awareness`);
  console.log(`Admin panel → http://localhost:${PORT}/api/admin`);
});

export default app;