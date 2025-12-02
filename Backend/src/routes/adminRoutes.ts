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
  getAllReports,
  assignVolunteerToReport,
  getRequestedFamilies,
  getApprovedFamilies,
  getRejectedFamilies,
  approveFamily,
  rejectFamily,
} from '../controllers/adminController';
import { BaseModel } from '../models/BaseModels';
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

// ==================== CASE REPORTS ROUTES ====================
// GET /api/admin/reports → Get all reported cases
router.get('/reports', getAllReports);

// PATCH /api/admin/reports/:reportId/assign → Assign volunteer to report
router.patch('/reports/:reportId/assign', assignVolunteerToReport);

// ==================== FAMILY MANAGEMENT ROUTES ====================
router.get('/families/requested', getRequestedFamilies);
router.get('/families/approved', getApprovedFamilies);
router.get('/families/rejected', getRejectedFamilies);
router.patch('/families/:family_id/approve', approveFamily);
router.patch('/families/:family_id/reject', rejectFamily);

// Assign volunteer to approved family → NO DB CHANGE NEEDED
router.patch('/families/:family_id/assign-volunteer', async (req, res) => {
  const { family_id } = req.params;
  const { volunteerId } = req.body;

  if (!volunteerId) {
    return res.status(400).json({ success: false, message: 'volunteerId is required in body' });
  }

  try {
    BaseModel.init();

    // 1. Update the family record
    const result = BaseModel.db
      .prepare(`
        UPDATE families 
        SET assigned_volunteer_id = ? 
        WHERE family_id = ? AND verification_status = 'verified'
      `)
      .run(volunteerId, family_id);

    if (result.changes === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Family not found or not approved' 
      });
    }

    // 2. Get family name for display (fixed TypeScript error)
    const family: any = BaseModel.db
      .prepare(`
        SELECT f.number_of_children, u.username AS parent_name 
        FROM families f 
        JOIN users u ON f.parent_id = u.user_id 
        WHERE f.family_id = ?
      `)
      .get(family_id);

    const displayName = `${family.parent_name} (${family.number_of_children} child${family.number_of_children > 1 ? 'ren' : ''})`;

    // 3. Insert into EXISTING verification_visits table using prefix trick
    BaseModel.db
      .prepare(`
        INSERT INTO verification_visits (
          visit_id,
          volunteer_id,
          target_id,
          target_type,
          visit_date,
          status,
          assigned_at
        ) VALUES (
          lower(hex(randomblob(8))),
          ?,
          ?,
          'report',
          datetime('now'),
          'assigned',
          datetime('now')
        )
      `)
      .run(volunteerId, `FAM-${family_id}`);

    res.json({ 
      success: true, 
      message: 'Volunteer assigned to family successfully',
      data: { family_id, assigned_volunteer_id: volunteerId }
    });
  } catch (err) {
    console.error('Error assigning volunteer to family:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;