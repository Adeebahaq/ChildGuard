import { Router, Response, NextFunction } from 'express';
import { ParentController } from '../controllers/parentController';
// CORRECTED: Importing authMiddleware function and AuthRequest type
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'; 

const router = Router();

// Custom middleware to ensure the authenticated user has the 'parent' role.
const requireParent = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    // Check if the user object was attached by authMiddleware
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
    }
    // Check for the specific role
    if (req.user.role !== 'parent') {
        return res.status(403).json({ success: false, message: 'Parent access required' });
    }
    next();
};

// Parent Routes: import...

// ... (existing imports and requireParent middleware)

// Middleware stack: 
router.use(authMiddleware);
router.use(requireParent); 

// === NEW ROUTE ===
// POST /api/parent/register-family 
// Submit a family application for review
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