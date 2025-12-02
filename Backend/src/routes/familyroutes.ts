// backend/src/routes/familyRoutes.ts
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { FamilyController } from '../controllers/familycontroller';
import multer from 'multer';
import path from 'path';

const router = Router();

// -----------------------------
// Multer configuration for file uploads
// -----------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/docs')); // store files in backend/public/docs
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// -----------------------------
// Routes
// -----------------------------

// Parent uploads proof documents (up to 5 files)
router.patch(
  '/my/proof',
  authMiddleware,
  upload.array('proof_documents', 5),
  (req: AuthRequest, res: Response) => FamilyController.uploadProofDocuments(req, res)
);

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

// Verify family (admin)
router.patch('/:family_id/verify', authMiddleware, (req: AuthRequest, res: Response) =>
  FamilyController.verifyFamily(req, res)
);

// Update support status (admin/volunteer)
router.patch('/:family_id/support', authMiddleware, (req: AuthRequest, res: Response) =>
  FamilyController.updateSupportStatus(req, res)
);

export default router;
