"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/challanRoutes.ts
const express_1 = require("express");
const challanController_1 = require("../controllers/challanController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Middleware to ensure user is authenticated as parent
const requireParent = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
    }
    if (req.user.role !== 'parent') {
        return res.status(403).json({ success: false, message: 'Parent access required' });
    }
    next();
};
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
// POST /api/challans/create - Parent uploads fee challan
router.post('/create', requireParent, challanController_1.ChallanController.createChallan);
// GET /api/challans - Get all challans (admin only)
router.get('/', requireAdmin, challanController_1.ChallanController.getAllChallans);
// GET /api/challans/:challan_id - Get single challan
router.get('/:challan_id', challanController_1.ChallanController.getChallan);
// PATCH /api/challans/:challan_id/verify - Admin verifies challan
router.patch('/:challan_id/verify', requireAdmin, challanController_1.ChallanController.verifyChallan);
// GET /api/challans/child/:child_id - Get all challans for a child
router.get('/child/:child_id', challanController_1.ChallanController.getChallansByChild);
exports.default = router;
