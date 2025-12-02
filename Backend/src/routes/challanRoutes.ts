// src/routes/challanRoutes.ts
import { Router, Response, NextFunction } from 'express';
import { ChallanController } from '../controllers/challanController';
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

// POST /api/challans/create - Parent uploads fee challan
router.post('/create', requireParent, ChallanController.createChallan);

// GET /api/challans - Get all challans (admin only)
router.get('/', requireAdmin, ChallanController.getAllChallans);


// PATCH /api/challans/:challan_id/verify - Admin verifies challan
router.patch('/:challan_id/verify', requireAdmin, ChallanController.verifyChallan);


// --- ORDER MATTERS ---
// 1. Get challans for a child
router.get('/child/:child_id', ChallanController.getChallansByChild);

// 2. Get single challan
router.get('/:challan_id', ChallanController.getChallan);


export default router;