"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/parentRoutes.ts
const express_1 = require("express");
const parentController_1 = require("../controllers/parentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const requireParent = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
    }
    if (req.user.role !== 'parent') {
        return res.status(403).json({ success: false, message: 'Parent access required' });
    }
    next();
};
// Middleware stack
router.use(authMiddleware_1.authMiddleware);
router.use(requireParent);
// POST /api/parent/register-family 
router.post('/register-family', parentController_1.ParentController.registerFamily);
// GET /api/parent/profile 
router.get('/profile', parentController_1.ParentController.getMyFullProfile);
// POST /api/parent/children
router.post('/children', parentController_1.ParentController.addChild);
// GET /api/parent/challans
router.get('/challans', parentController_1.ParentController.getMyChallans);
// PATCH /api/parent/challans/:challan_id/paid
router.patch('/challans/:challan_id/paid', parentController_1.ParentController.markChallanPaid);
exports.default = router;
