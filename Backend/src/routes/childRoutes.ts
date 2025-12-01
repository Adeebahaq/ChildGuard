// src/routes/childRoutes.ts
import { Router, Response, NextFunction } from 'express';
import { ChildController } from '../controllers/childController';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Middleware to ensure user is authenticated as parent
const requireParent = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
    }
    if (req.user.role !== 'parent') {
        return res.status(403).json({ success: false, message: 'Parent access required' });
    }
    next();
};

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/children/:child_id - Get child details (any authenticated user can view)
router.get('/:child_id', ChildController.getChild);

// PUT /api/children/:child_id - Update child info (parent only)
router.put('/:child_id', requireParent, ChildController.updateChild);

// PATCH /api/children/:child_id/photo - Update child photo (parent only)
router.patch('/:child_id/photo', requireParent, ChildController.updatePhoto);

// DELETE /api/children/:child_id - Delete child (parent only)
router.delete('/:child_id', requireParent, ChildController.deleteChild);

export default router;