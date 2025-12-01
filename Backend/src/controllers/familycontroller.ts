// backend/src/controllers/familyController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { FamilyModel } from '../models/family';
import { ChildProfileModel } from '../models/childprofile';

export class FamilyController {
  
  // GET /api/families/my - Parent gets their own family
  static async getMyFamily(req: AuthRequest, res: Response) {
    try {
      const parentId = req.user!.user_id;

      const family = FamilyModel.getByParentId(parentId);

      if (!family) {
        return res.json({
          success: true,
          message: 'No family registered yet.',
          family: null,
        });
      }

      // Get all children for this family
      const children = ChildProfileModel.getByFamilyId(family.family_id);

      return res.json({
        success: true,
        message: 'Family data retrieved successfully.',
        family: {
          ...family,
          children,
        },
      });
    } catch (error: any) {
      console.error('Get My Family Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve family data.',
      });
    }
  }

  // GET /api/families - Admin/Volunteer gets all families
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const userRole = req.user!.role;

      // Only admin and volunteer can view all families
      if (userRole !== 'admin' && userRole !== 'volunteer') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin or Volunteer role required.',
        });
      }

      const families = FamilyModel.getAll();

      return res.json({
        success: true,
        message: 'All families retrieved successfully.',
        data: { families },
      });
    } catch (error: any) {
      console.error('Get All Families Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve families.',
      });
    }
  }

  // GET /api/families/:family_id - Get specific family by ID
  static async getById(req: AuthRequest, res: Response) {
    try {
      const { family_id } = req.params;
      const userRole = req.user!.role;
      const userId = req.user!.user_id;

      const family = FamilyModel.getById(family_id);

      if (!family) {
        return res.status(404).json({
          success: false,
          message: 'Family not found.',
        });
      }

      // Check permissions: parent can only view their own family
      if (userRole === 'parent' && family.parent_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own family.',
        });
      }

      // Get children for this family
      const children = ChildProfileModel.getByFamilyId(family_id);

      return res.json({
        success: true,
        message: 'Family retrieved successfully.',
        data: { family, children },
      });
    } catch (error: any) {
      console.error('Get Family By ID Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve family.',
      });
    }
  }

  // PATCH /api/families/:family_id/verify - Volunteer/Admin verifies family
  static async verifyFamily(req: AuthRequest, res: Response) {
    try {
      const { family_id } = req.params;
      const { status } = req.body; // 'verified' | 'rejected'
      const userRole = req.user!.role;
      const userId = req.user!.user_id;

      // Only admin and volunteer can verify
      if (userRole !== 'admin' && userRole !== 'volunteer') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin or Volunteer role required.',
        });
      }

      if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be "verified" or "rejected".',
        });
      }

      const family = FamilyModel.getById(family_id);
      if (!family) {
        return res.status(404).json({
          success: false,
          message: 'Family not found.',
        });
      }

      // Update verification status
      FamilyModel.verifyFamily(family_id, status, userId);

      return res.json({
        success: true,
        message: `Family ${status === 'verified' ? 'approved' : 'rejected'} successfully.`,
      });
    } catch (error: any) {
      console.error('Verify Family Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify family.',
      });
    }
  }

  // PATCH /api/families/:family_id/support - Update support status
  static async updateSupportStatus(req: AuthRequest, res: Response) {
    try {
      const { family_id } = req.params;
      const { status, sponsor_id } = req.body; // 'shortlisted' | 'sponsored'
      const userRole = req.user!.role;

      // Only admin and volunteer can update support status
      if (userRole !== 'admin' && userRole !== 'volunteer') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin or Volunteer role required.',
        });
      }

      if (!['shortlisted', 'sponsored'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be "shortlisted" or "sponsored".',
        });
      }

      const family = FamilyModel.getById(family_id);
      if (!family) {
        return res.status(404).json({
          success: false,
          message: 'Family not found.',
        });
      }

      // Update support status
      FamilyModel.updateSupportStatus(family_id, status, sponsor_id);

      return res.json({
        success: true,
        message: `Family marked as ${status} successfully.`,
      });
    } catch (error: any) {
      console.error('Update Support Status Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update support status.',
      });
    }
  }

  // PATCH /api/families/my/proof - Parent uploads proof documents
  static async uploadProofDocuments(req: AuthRequest, res: Response) {
    try {
      const parentId = req.user!.user_id;
      const { proof_documents } = req.body;

      if (!Array.isArray(proof_documents)) {
        return res.status(400).json({
          success: false,
          message: 'proof_documents must be an array of strings.',
        });
      }

      const family = FamilyModel.getByParentId(parentId);
      if (!family) {
        return res.status(404).json({
          success: false,
          message: 'Family not found. Please register your family first.',
        });
      }

      // Upload proof documents
      FamilyModel.uploadProofDocuments(family.family_id, proof_documents);

      return res.json({
        success: true,
        message: 'Proof documents uploaded successfully.',
      });
    } catch (error: any) {
      console.error('Upload Proof Documents Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload proof documents.',
      });
    }
  }
}