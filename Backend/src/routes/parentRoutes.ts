// backend/src/routes/parentRoutes.ts
import { Router, Response, NextFunction } from 'express';
import { ParentController } from '../controllers/parentController';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'; 

const router = Router();

const requireParent = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
    }
    if (req.user.role !== 'parent') {
        return res.status(403).json({ success: false, message: 'Parent access required' });
    }
    next();
};

// Middleware stack
router.use(authMiddleware);
router.use(requireParent); 

// POST /api/parent/register-family 
router.post('/register-family', ParentController.registerFamily); 

// GET /api/parent/profile 
router.get('/profile', ParentController.getMyFullProfile);

// POST /api/parent/children
router.post('/children', ParentController.addChild);

// GET /api/parent/challans
router.get('/challans', ParentController.getMyChallans);

// PATCH /api/parent/challans/:challan_id/paid
router.patch('/challans/:challan_id/paid', ParentController.markChallanPaid);

export default router;