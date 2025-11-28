// src/routes/adminRoutes.ts
import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';
import {
  createAwarenessContent,
  getAllAwarenessContents,
  updateAwarenessContent,
  deleteAwarenessContent,
} from '../controllers/adminController';

const router = Router();

// Apply authentication to all admin routes
router.use(authMiddleware);

// Restrict all routes below to admin role only
router.use(requireAdmin);

// POST /api/admin/awareness-contents → Create new content (article/video/guide)
router.post('/awareness-contents', createAwarenessContent);

// GET /api/admin/awareness-contents → Get all content including drafts (admin panel)
router.get('/awareness-contents', getAllAwarenessContents);

// PATCH /api/admin/awareness-contents/:content_id → Update content
router.patch('/awareness-contents/:content_id', updateAwarenessContent);

// DELETE /api/admin/awareness-contents/:content_id → Delete content
router.delete('/awareness-contents/:content_id', deleteAwarenessContent);

export default router;