// src/routes/applicationRoutes.ts
import { Router, Response, NextFunction } from 'express';
import { ApplicationController } from '../controllers/applicationController';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Middleware to ensure user is authenticated as admin
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/applications - Get all applications (admin only - view only)
router.get('/', requireAdmin, ApplicationController.getAllApplications);

// GET /api/applications/:application_id - Get one application
router.get('/:application_id', ApplicationController.getApplication);

// GET /api/applications/child/:child_id - Get applications for a specific child
router.get('/child/:child_id', ApplicationController.getApplicationsByChild);

export default router;