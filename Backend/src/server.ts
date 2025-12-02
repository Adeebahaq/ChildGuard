// src/server.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
// ── Import centralized routes ────────────────
import routes from './routes/index'; // This has ALL routes registered
// ── Import centralized routes (contains ALL features from both teams) ────────
// volunteer, admin, parent, family, challans, etc.

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));                    // Support large file uploads (photos, documents)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files (photos, documents, etc.)
// ── Serve uploaded files (photos, documents, awareness images, etc.) ─────
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));
app.use('/challans', express.static(path.join(__dirname, '../public/challans')));

// ── Mount ALL routes under /api ─────────────
// ── Mount ALL API routes under /api + legacy direct mounts ───────────────────
// This gives maximum compatibility with both old and new frontend code
app.use('/api', routes);        // ✅ This registers ALL routes from index.ts
app.use('/', routes);           // ← LEGACY SUPPORT: For old direct calls like /volunteer/..., /case/...
// ── Optional: Keep direct mounts for critical paths (100% backward compatibility) ──
app.use('/volunteer', routes);
app.use('/case', routes);
app.use('/visits', routes);
app.use('/user', routes);
app.use('/availability', routes);

// ── 404 Handler ─────────────────────────────
// ── 404 Handler — Helpful for debugging ─────────────────────────────────────
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    tip: 'Make sure you are using correct path under /api or direct legacy paths',
    availableEndpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/parent/register-family',
      'GET /api/parent/profile',
      'POST /api/parent/children',
      'GET /api/parent/challans',
      'PUT /api/children/:child_id',
      'POST /api/challans/create',
      'GET /api/family/my',
      'GET /api/awareness/articles',
      'GET /case/reports',
      'GET /uploads/... (photos)',
      'POST   /api/auth/register',
      'POST   /api/auth/login',
      'GET    /api/admin/volunteers',
      'POST   /volunteer/:id/request',
      'GET    /case/reports',
      'POST   /api/parent/register-family',
      'GET    /api/parent/challans',
      'GET    /api/awareness/articles',
      'GET    /uploads/... (images, documents)',
      'GET    / (API welcome message)'
    ],
    team: "Built with love by You & Your Amazing Friend"
  });
});

// ── Start Server ────────────────────────────
// ── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`ChildGuard Backend LIVE → http://localhost:${PORT}`);
  console.log(`Static uploads → http://localhost:${PORT}/uploads`);
  console.log(`Public awareness → http://localhost:${PORT}/api/awareness`);
  console.log(`Admin panel → http://localhost:${PORT}/api/admin`);
  
  console.log(`\nChildGuard Backend LIVE → http://localhost:${PORT}`);
  console.log(`Static uploads     → http://localhost:${PORT}/uploads`);
  console.log(`API Root           → http://localhost:${PORT}/api`);
  console.log(`Legacy Routes      → /volunteer, /case, /admin, etc.`);
  console.log(`Admin Panel        → http://localhost:${PORT}/api/admin`);
  console.log(`Public Awareness   → http://localhost:${PORT}/api/awareness`);
  console.log(`Parent Dashboard   → http://localhost:${PORT}/api/parent`);
  console.log(`\nAll systems merged successfully! Volunteer + Admin + Parent = FULL POWER\n`);
});

export default app;