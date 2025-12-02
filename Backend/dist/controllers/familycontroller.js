"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyController = void 0;
const family_1 = require("../models/family");
const childprofile_1 = require("../models/childprofile");
class FamilyController {
    // GET /api/families/my - Parent gets their own family
    static async getMyFamily(req, res) {
        try {
            const parentId = req.user.user_id;
            const family = family_1.FamilyModel.getByParentId(parentId);
            if (!family) {
                return res.json({
                    success: true,
                    message: 'No family registered yet.',
                    family: null,
                });
            }
            // Get all children for this family
            const children = childprofile_1.ChildProfileModel.getByFamilyId(family.family_id);
            return res.json({
                success: true,
                message: 'Family data retrieved successfully.',
                family: {
                    ...family,
                    children,
                },
            });
        }
        catch (error) {
            console.error('Get My Family Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve family data.',
            });
        }
    }
    // GET /api/families - Admin/Volunteer gets all families
    static async getAll(req, res) {
        try {
            const userRole = req.user.role;
            // Only admin and volunteer can view all families
            if (userRole !== 'admin' && userRole !== 'volunteer') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin or Volunteer role required.',
                });
            }
            const families = family_1.FamilyModel.getAll();
            return res.json({
                success: true,
                message: 'All families retrieved successfully.',
                data: { families },
            });
        }
        catch (error) {
            console.error('Get All Families Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve families.',
            });
        }
    }
    // GET /api/families/:family_id - Get specific family by ID
    static async getById(req, res) {
        try {
            const { family_id } = req.params;
            const userRole = req.user.role;
            const userId = req.user.user_id;
            const family = family_1.FamilyModel.getById(family_id);
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
            const children = childprofile_1.ChildProfileModel.getByFamilyId(family_id);
            return res.json({
                success: true,
                message: 'Family retrieved successfully.',
                data: { family, children },
            });
        }
        catch (error) {
            console.error('Get Family By ID Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve family.',
            });
        }
    }
    // PATCH /api/families/:family_id/verify - Volunteer/Admin verifies family
    static async verifyFamily(req, res) {
        try {
            const { family_id } = req.params;
            const { status } = req.body; // 'verified' | 'rejected'
            const userRole = req.user.role;
            const userId = req.user.user_id;
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
            const family = family_1.FamilyModel.getById(family_id);
            if (!family) {
                return res.status(404).json({
                    success: false,
                    message: 'Family not found.',
                });
            }
            // Update verification status
            family_1.FamilyModel.verifyFamily(family_id, status, userId);
            return res.json({
                success: true,
                message: `Family ${status === 'verified' ? 'approved' : 'rejected'} successfully.`,
            });
        }
        catch (error) {
            console.error('Verify Family Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to verify family.',
            });
        }
    }
    // PATCH /api/families/:family_id/support - Update support status
    static async updateSupportStatus(req, res) {
        try {
            const { family_id } = req.params;
            const { status, sponsor_id } = req.body; // 'shortlisted' | 'sponsored'
            const userRole = req.user.role;
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
            const family = family_1.FamilyModel.getById(family_id);
            if (!family) {
                return res.status(404).json({
                    success: false,
                    message: 'Family not found.',
                });
            }
            // Update support status
            family_1.FamilyModel.updateSupportStatus(family_id, status, sponsor_id);
            return res.json({
                success: true,
                message: `Family marked as ${status} successfully.`,
            });
        }
        catch (error) {
            console.error('Update Support Status Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to update support status.',
            });
        }
    }
    // PATCH /api/families/my/proof - Parent uploads proof documents
    static async uploadProofDocuments(req, res) {
        try {
            const parentId = req.user.user_id;
            const { proof_documents } = req.body;
            if (!Array.isArray(proof_documents)) {
                return res.status(400).json({
                    success: false,
                    message: 'proof_documents must be an array of strings.',
                });
            }
            const family = family_1.FamilyModel.getByParentId(parentId);
            if (!family) {
                return res.status(404).json({
                    success: false,
                    message: 'Family not found. Please register your family first.',
                });
            }
            // Upload proof documents
            family_1.FamilyModel.uploadProofDocuments(family.family_id, proof_documents);
            return res.json({
                success: true,
                message: 'Proof documents uploaded successfully.',
            });
        }
        catch (error) {
            console.error('Upload Proof Documents Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to upload proof documents.',
            });
        }
    }
}
exports.FamilyController = FamilyController;
