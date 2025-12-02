"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/childRoutes.ts
const express_1 = require("express");
const childController_1 = require("../controllers/childController");
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
// Apply authentication middleware to all routes
router.use(authMiddleware_1.authMiddleware);
// GET /api/children/:child_id - Get child details (any authenticated user can view)
router.get('/:child_id', childController_1.ChildController.getChild);
// PUT /api/children/:child_id - Update child info (parent only)
router.put('/:child_id', requireParent, childController_1.ChildController.updateChild);
// PATCH /api/children/:child_id/photo - Update child photo (parent only)
router.patch('/:child_id/photo', requireParent, childController_1.ChildController.updatePhoto);
// DELETE /api/children/:child_id - Delete child (parent only)
router.delete('/:child_id', requireParent, childController_1.ChildController.deleteChild);
exports.default = router;
