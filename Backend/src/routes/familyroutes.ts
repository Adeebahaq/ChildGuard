// backend/src/routes/familyRoutes.ts
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'; // FIXED: Import AuthRequest
import { FamilyController } from '../controllers/familycontroller';

const router = Router();

// Parent gets their own family
router.get('/my', authMiddleware, (req: AuthRequest, res: Response) =>
  FamilyController.getMyFamily(req, res)
);

// Admin/Volunteer gets all families
router.get('/', authMiddleware, (req: AuthRequest, res: Response) =>
  FamilyController.getAll(req, res)
);

// Get specific family by ID
router.get('/:family_id', authMiddleware, (req: AuthRequest, res: Response) =>
  FamilyController.getById(req, res)
);

// Verify family
router.patch('/:family_id/verify', authMiddleware, (req: AuthRequest, res: Response) =>
  FamilyController.verifyFamily(req, res)
);

// Update support status
router.patch('/:family_id/support', authMiddleware, (req: AuthRequest, res: Response) =>
  FamilyController.updateSupportStatus(req, res)
);

// Upload proof documents
router.patch('/my/proof', authMiddleware, (req: AuthRequest, res: Response) =>
  FamilyController.uploadProofDocuments(req, res)
);

export default router;