// src/routes/adminRoutes.ts
import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';
import {
  createAwarenessContent,
  getAllAwarenessContents,
  updateAwarenessContent,
  deleteAwarenessContent,
  getAllVolunteers,
  getRequestedVolunteers,
  getVolunteerById,
  approveVolunteer,
  rejectVolunteer,
  updateVolunteerAvailability,
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
// GET /api/admin/volunteers → Get all volunteers
router.get('/volunteers', getAllVolunteers);
// GET /api/admin/volunteers/requested → Get requested volunteers
router.get('/volunteers/requested', getRequestedVolunteers);
// GET /api/admin/volunteers/:volunteer_id → Get volunteer by ID
router.get('/volunteers/:volunteer_id', getVolunteerById);
// PATCH /api/admin/volunteers/:volunteer_id/approve → Approve volunteer
router.patch('/volunteers/:volunteer_id/approve', approveVolunteer);
// PATCH /api/admin/volunteers/:volunteer_id/reject → Reject volunteer
router.patch('/volunteers/:volunteer_id/reject', rejectVolunteer);
// PATCH /api/admin/volunteers/:volunteer_id/availability → Update volunteer availability
router.patch('/volunteers/:volunteer_id/availability', updateVolunteerAvailability);
export default router;