"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/adminRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
// Apply authentication to all admin routes
router.use(authMiddleware_1.authMiddleware);
// Restrict all routes below to admin role only
router.use(authMiddleware_1.requireAdmin);
// POST /api/admin/awareness-contents → Create new content (article/video/guide)
router.post('/awareness-contents', adminController_1.createAwarenessContent);
// GET /api/admin/awareness-contents → Get all content including drafts (admin panel)
router.get('/awareness-contents', adminController_1.getAllAwarenessContents);
// PATCH /api/admin/awareness-contents/:content_id → Update content
router.patch('/awareness-contents/:content_id', adminController_1.updateAwarenessContent);
// DELETE /api/admin/awareness-contents/:content_id → Delete content
router.delete('/awareness-contents/:content_id', adminController_1.deleteAwarenessContent);
// GET /api/admin/volunteers → Get all volunteers
router.get('/volunteers', adminController_1.getAllVolunteers);
// GET /api/admin/volunteers/requested → Get requested volunteers
router.get('/volunteers/requested', adminController_1.getRequestedVolunteers);
// GET /api/admin/volunteers/:volunteer_id → Get volunteer by ID
router.get('/volunteers/:volunteer_id', adminController_1.getVolunteerById);
// PATCH /api/admin/volunteers/:volunteer_id/approve → Approve volunteer
router.patch('/volunteers/:volunteer_id/approve', adminController_1.approveVolunteer);
// PATCH /api/admin/volunteers/:volunteer_id/reject → Reject volunteer
router.patch('/volunteers/:volunteer_id/reject', adminController_1.rejectVolunteer);
// PATCH /api/admin/volunteers/:volunteer_id/availability → Update volunteer availability
router.patch('/volunteers/:volunteer_id/availability', adminController_1.updateVolunteerAvailability);
// ==================== CASE REPORTS ROUTES ====================
// GET /api/admin/reports → Get all reported cases
router.get('/reports', adminController_1.getAllReports);
// PATCH /api/admin/reports/:reportId/assign → Assign volunteer to report
router.patch('/reports/:reportId/assign', adminController_1.assignVolunteerToReport);
exports.default = router;
