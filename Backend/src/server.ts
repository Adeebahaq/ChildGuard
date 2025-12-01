import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// ── Import centralized routes ────────────────
import routes from './routes/index';  // This has ALL routes registered

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

// ── Mount ALL routes under /api ─────────────
app.use('/api', routes);  // ✅ This registers ALL routes from index.ts

// ── 404 Handler ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableEndpoints: [
      'POST   /api/auth/register',
      'POST   /api/auth/login',
      'POST   /api/parent/register-family',
      'GET    /api/parent/profile',
      'POST   /api/parent/children',
      'GET    /api/parent/challans',
      'PUT    /api/children/:child_id',
      'POST   /api/challans/create',
      'GET    /api/family/my',
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