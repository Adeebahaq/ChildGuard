"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/applicationRoutes.ts
const express_1 = require("express");
const applicationController_1 = require("../controllers/applicationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Middleware to ensure user is authenticated as admin
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};
// Apply authentication middleware to all routes
router.use(authMiddleware_1.authMiddleware);
// GET /api/applications - Get all applications (admin only - view only)
router.get('/', requireAdmin, applicationController_1.ApplicationController.getAllApplications);
// GET /api/applications/:application_id - Get one application
router.get('/:application_id', applicationController_1.ApplicationController.getApplication);
// GET /api/applications/child/:child_id - Get applications for a specific child
router.get('/child/:child_id', applicationController_1.ApplicationController.getApplicationsByChild);
exports.default = router;
