"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
// FINAL MERGED VERSION — COMPLETE CHILDGUARD BACKEND (You + Your Friend = Unstoppable Team)
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// ── Import centralized routes (contains ALL features from both teams) ────────
const index_1 = __importDefault(require("./routes/index")); // ← This now includes EVERYTHING: volunteer, admin, parent, family, challans, etc.
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ── Middleware ───────────────────────────
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' })); // Support large file uploads (photos, documents)
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// ── Serve uploaded files (photos, documents, awareness images, etc.) ─────
const uploadsDir = path_1.default.join(__dirname, '..', 'public', 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
}
app.use('/uploads', express_1.default.static(uploadsDir));
// ── Mount ALL API routes under /api + legacy direct mounts ───────────────────
// This gives maximum compatibility with both old and new frontend code
app.use('/api', index_1.default); // ← NEW & CLEAN: All modern routes
app.use('/', index_1.default); // ← LEGACY SUPPORT: For old direct calls like /volunteer/..., /case/...
// ── Optional: Keep direct mounts for critical paths (100% backward compatibility) ──
app.use('/volunteer', index_1.default);
app.use('/case', index_1.default);
app.use('/visits', index_1.default);
app.use('/user', index_1.default);
app.use('/availability', index_1.default);
// ── 404 Handler — Helpful for debugging ─────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        tip: 'Make sure you are using correct path under /api or direct legacy paths',
        availableEndpoints: [
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
// ── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\nChildGuard Backend LIVE → http://localhost:${PORT}`);
    console.log(`Static uploads     → http://localhost:${PORT}/uploads`);
    console.log(`API Root           → http://localhost:${PORT}/api`);
    console.log(`Legacy Routes      → /volunteer, /case, /admin, etc.`);
    console.log(`Admin Panel        → http://localhost:${PORT}/api/admin`);
    console.log(`Public Awareness   → http://localhost:${PORT}/api/awareness`);
    console.log(`Parent Dashboard   → http://localhost:${PORT}/api/parent`);
    console.log(`\nAll systems merged successfully! Volunteer + Admin + Parent = FULL POWER\n`);
});
exports.default = app;
