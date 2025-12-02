"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildController = void 0;
const childprofile_1 = require("../models/childprofile");
const family_1 = require("../models/family");
// Wrapper for error handling
const safeController = (handler) => {
    return async (req, res) => {
        try {
            await handler(req, res);
        }
        catch (error) {
            console.error('Child Controller Error:', error);
            const errorMessage = error.message || 'An unexpected server error occurred.';
            if (!res.headersSent) {
                let statusCode = 500;
                // Determine appropriate HTTP status code
                if (errorMessage.includes('not found')) {
                    statusCode = 404;
                }
                else if (errorMessage.includes('Unauthorized') || errorMessage.includes('permission')) {
                    statusCode = 403;
                }
                else if (errorMessage.includes('required') || errorMessage.includes('must be between')) {
                    statusCode = 400; // Client-side or data validation error
                }
                res.status(statusCode).json({
                    success: false,
                    message: errorMessage,
                });
            }
        }
    };
};
class ChildController {
    // POST /api/parent/children - Create new child (Handles B-Form and Class requirements)
    static createChild = safeController(async (req, res) => {
        const parentId = req.user.user_id;
        const { name, age, gender, needs, orphan_status, bform_no, class: childClass } = req.body;
        const parsedAge = parseInt(age, 10);
        // --- VALIDATION FOR REQUIRED FIELDS AND AGE RANGE ---
        if (!bform_no || typeof bform_no !== 'string' || bform_no.trim() === '') {
            return res.status(400).json({ success: false, message: 'B-Form Number is required.' });
        }
        if (!childClass || typeof childClass !== 'string' || childClass.trim() === '') {
            return res.status(400).json({ success: false, message: 'Class/Grade is required.' });
        }
        // Custom Age Check: must be between 5 and 18
        if (isNaN(parsedAge) || parsedAge < 5 || parsedAge > 18) {
            return res.status(400).json({ success: false, message: 'Child age must be between 1 and 18.' });
        }
        // --------------------------------------------------------
        // 1. Get family ID and check verification status
        const family = family_1.FamilyModel.getByParentId(parentId);
        if (!family) {
            return res.status(404).json({ success: false, message: 'Family not found for this user.' });
        }
        // Enforcement of the 'approved family application' rule
        if (family.verification_status !== 'verified') {
            return res.status(403).json({
                success: false,
                message: 'You must have an approved family application (verified status) before adding children.'
            });
        }
        // 2. Prepare data for model
        const childData = {
            family_id: family.family_id,
            name,
            age: parsedAge, // Use the parsed and validated age
            gender,
            needs: needs || null,
            orphan_status: (orphan_status || 'none').toLowerCase().replace(' ', '_'),
            // --- FIX: PASSING NEW REQUIRED FIELDS ---
            bform_no: bform_no.trim(),
            class: childClass.trim(),
            // ----------------------------------------
        };
        // 3. Create child
        const newChild = childprofile_1.ChildProfileModel.create(childData); // No longer throwing error due to missing fields
        res.status(201).json({ success: true, message: 'Child registered successfully.', data: newChild });
    });
    // ... (Other controller methods: getChild, updateChild, updatePhoto, deleteChild remain the same) ...
    // GET /api/children/:child_id - Get child details
    static getChild = safeController(async (req, res) => {
        const { child_id } = req.params;
        const child = childprofile_1.ChildProfileModel.getById(child_id);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Child not found.' });
        }
        res.json({ success: true, data: child });
    });
    // PUT /api/children/:child_id - Update child info (parent only)
    static updateChild = safeController(async (req, res) => {
        const { child_id } = req.params;
        const parentId = req.user.user_id;
        // Include bform_no and class for optional update
        const { name, age, gender, grade, school, story, needs, orphan_status, bform_no, class: childClass } = req.body;
        // Check if child exists
        const child = childprofile_1.ChildProfileModel.getById(child_id);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Child not found.' });
        }
        // Verify parent owns this child
        const family = family_1.FamilyModel.getByParentId(parentId);
        if (!family || child.family_id !== family.family_id) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You can only update your own children.' });
        }
        // Update child
        const updatedChild = childprofile_1.ChildProfileModel.update(child_id, {
            name,
            age: age ? parseInt(age, 10) : undefined,
            gender,
            grade,
            school,
            story,
            needs,
            orphan_status: orphan_status ? orphan_status.toLowerCase().replace(' ', '_') : undefined,
            bform_no,
            class: childClass,
        });
        res.json({ success: true, message: 'Child information updated successfully.', data: updatedChild });
    });
    // PATCH /api/children/:child_id/photo - Update child photo
    static updatePhoto = safeController(async (req, res) => {
        const { child_id } = req.params;
        const parentId = req.user.user_id;
        const { photo_url } = req.body;
        if (!photo_url) {
            return res.status(400).json({ success: false, message: 'Photo URL is required.' });
        }
        // Check if child exists
        const child = childprofile_1.ChildProfileModel.getById(child_id);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Child not found.' });
        }
        // Verify parent owns this child
        const family = family_1.FamilyModel.getByParentId(parentId);
        if (!family || child.family_id !== family.family_id) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You can only update your own children.' });
        }
        // Update photo
        childprofile_1.ChildProfileModel.updatePhoto(child_id, photo_url);
        const updatedChild = childprofile_1.ChildProfileModel.getById(child_id);
        res.json({ success: true, message: 'Child photo updated successfully.', data: updatedChild });
    });
    // DELETE /api/children/:child_id - Delete child (parent only)
    static deleteChild = safeController(async (req, res) => {
        const { child_id } = req.params;
        const parentId = req.user.user_id;
        // Check if child exists
        const child = childprofile_1.ChildProfileModel.getById(child_id);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Child not found.' });
        }
        // Verify parent owns this child
        const family = family_1.FamilyModel.getByParentId(parentId);
        if (!family || child.family_id !== family.family_id) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You can only delete your own children.' });
        }
        // Delete child
        childprofile_1.ChildProfileModel.delete(child_id);
        res.json({ success: true, message: `Child ${child.name} deleted successfully.` });
    });
}
exports.ChildController = ChildController;
