import express from 'express';
import cors from 'cors';
import path from 'path'; 
import fs from 'fs'; // Needed for uploads directory creation

// ── Existing routes ─────────────────────
import indexRouter from './routes/index';
import authRoutes from './routes/authRoutes'; 
import familyRoutes from './routes/familyroutes'; // From 'main'
import caseReporterRoutes from "./routes/caseReporterRoutes";
import visitsRoutes from "./routes/visitsRoutes"; // From 'HEAD'
import volunteerRoutes from "./routes/volunteerRoutes"; // From 'HEAD'
import userRoutes from "./routes/UserRoutes"; // From 'HEAD'
import parentRoutes from './routes/parentRoutes'; 
// ... later in the file ...


// ── NEW: Awareness module routes ────────
import adminRoutes from './routes/adminRoutes'; // From 'HEAD' (Admin-only)
import awarenessRoutes from './routes/awarenessRoutes'; // From 'HEAD' (Public content)

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────
app.use(cors());
// Adopted 'main' limits for larger payloads (e.g., image uploads)
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 

// Uploads folder setup (Adopted 'main' logic for directory creation)
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir)); 

// ── Route mounting ───────────────────────
app.use('/', indexRouter); 
app.use('/api/auth', authRoutes);
app.use('/api/auth/families', familyRoutes);     // Mounted family routes from 'main'
app.use("/case", caseReporterRoutes); 

// Routes from 'HEAD'
app.use("/visits", visitsRoutes);
app.use("/volunteer", volunteerRoutes);
app.use("/user", userRoutes);
app.use("/availability", userRoutes);

// NEW: Mounted awareness routes from 'HEAD'
app.use('/api/admin', adminRoutes);         // Admin content management
app.use('/api/awareness', awarenessRoutes); // Public content display

app.use("/api/parent", parentRoutes);

// 404 Handler (Adopted 'main's custom 404 handler, must be last route)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    working: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/families/enroll (with Bearer token)',
      'GET  /api/auth/families/my (with Bearer token)',
      'GET  /api/awareness (New public content route)',
      'POST /api/admin/awareness-contents (New admin route)'
    ]
  });
});

// ── Start server ────────────────────── ───
app.listen(PORT, () => {
  console.log(`ChildGuard Backend LIVE → http://localhost:${PORT}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static uploads from: ${uploadsDir}`);
  
  // Helpful logs for the new awareness module
  console.log(`Public awareness content  → http://localhost:${PORT}/api/awareness`);
  console.log(`Admin awareness panel     → http://localhost:${PORT}/api/admin/awareness-contents`);
});