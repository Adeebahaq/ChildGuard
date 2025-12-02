"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/familyRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware"); // FIXED: Import AuthRequest
const familycontroller_1 = require("../controllers/familycontroller");
const router = (0, express_1.Router)();
// Parent gets their own family
router.get('/my', authMiddleware_1.authMiddleware, (req, res) => familycontroller_1.FamilyController.getMyFamily(req, res));
// Admin/Volunteer gets all families
router.get('/', authMiddleware_1.authMiddleware, (req, res) => familycontroller_1.FamilyController.getAll(req, res));
// Get specific family by ID
router.get('/:family_id', authMiddleware_1.authMiddleware, (req, res) => familycontroller_1.FamilyController.getById(req, res));
// Verify family
router.patch('/:family_id/verify', authMiddleware_1.authMiddleware, (req, res) => familycontroller_1.FamilyController.verifyFamily(req, res));
// Update support status
router.patch('/:family_id/support', authMiddleware_1.authMiddleware, (req, res) => familycontroller_1.FamilyController.updateSupportStatus(req, res));
// Upload proof documents
router.patch('/my/proof', authMiddleware_1.authMiddleware, (req, res) => familycontroller_1.FamilyController.uploadProofDocuments(req, res));
exports.default = router;
