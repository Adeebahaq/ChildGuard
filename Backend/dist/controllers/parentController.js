"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentController = void 0;
const parent_1 = require("../models/parent");
const family_1 = require("../models/family");
const childprofile_1 = require("../models/childprofile");
const feechallan_1 = require("../models/feechallan");
const safeController = (handler) => {
    return async (req, res) => {
        try {
            await handler(req, res);
        }
        catch (error) {
            console.error('Controller Error:', error);
            const errorMessage = error.message || 'An unexpected server error occurred.';
            if (!res.headersSent) {
                let statusCode = 500;
                // Adjusting status code determination for better error handling
                if (errorMessage.includes('not found')) {
                    statusCode = 404;
                }
                else if (errorMessage.includes('Unauthorized') || errorMessage.includes('permission')) {
                    statusCode = 403;
                }
                else if (errorMessage.includes('required') ||
                    errorMessage.includes('must be between') || // For age validation
                    errorMessage.includes('already registered') ||
                    errorMessage.includes('must be verified') // For verification status checks
                ) {
                    statusCode = 400;
                }
                res.status(statusCode).json({
                    success: false,
                    message: errorMessage,
                });
            }
        }
    };
};
class ParentController {
    // POST /api/parent/register-family
    static registerFamily = safeController(async (req, res) => {
        const parentId = req.user.user_id;
        const { income, address, phone, cnic, proof_documents } = req.body;
        // Validate required fields
        if (!income || !address || !phone || !cnic) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: income, address, phone, and CNIC are required.'
            });
        }
        // Validate CNIC format (13 digits)
        const cnicDigits = cnic.replace(/\D/g, '');
        if (cnicDigits.length !== 13) {
            return res.status(400).json({
                success: false,
                message: 'CNIC must be exactly 13 digits.'
            });
        }
        // Validate phone format (11 digits for Pakistan)
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length !== 11) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be exactly 11 digits.'
            });
        }
        // Check if family already exists
        const existingFamily = family_1.FamilyModel.getByParentId(parentId);
        if (existingFamily) {
            return res.status(400).json({
                success: false,
                message: 'You have already registered a family application.'
            });
        }
        // Check if CNIC is already registered
        const existingCnic = parent_1.ParentModel.db.prepare(`
            SELECT parent_id FROM parents WHERE cnic = ? AND parent_id != ?
        `).get(cnicDigits, parentId);
        if (existingCnic) {
            return res.status(400).json({
                success: false,
                message: 'This CNIC is already registered with another account.'
            });
        }
        // 1. Update parent's phone, address, and CNIC
        const updateParent = parent_1.ParentModel.db.prepare(`
            UPDATE parents 
            SET phone = ?, address = ?, cnic = ?
            WHERE parent_id = ?
        `);
        updateParent.run(phoneDigits, address, cnicDigits, parentId);
        // 2. Create family with same address
        const newFamily = family_1.FamilyModel.create({
            parent_id: parentId,
            income: parseInt(income, 10),
            address,
            proof_documents: Array.isArray(proof_documents) ? proof_documents : [],
        });
        // 3. Get updated parent info
        const updatedParent = parent_1.ParentModel.find(parentId);
        res.status(201).json({
            success: true,
            message: 'Family application submitted successfully for verification.',
            data: {
                family: newFamily,
                parent: updatedParent
            }
        });
    });
    // GET /api/parent/profile
    static getMyFullProfile = safeController(async (req, res) => {
        const parentId = req.user.user_id;
        const parent = parent_1.ParentModel.find(parentId);
        if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent profile not found.' });
        }
        const family = family_1.FamilyModel.getByParentId(parentId) || null;
        let children = [];
        if (family) {
            children = childprofile_1.ChildProfileModel.getByFamilyId(family.family_id);
        }
        res.json({
            success: true,
            message: 'Profile loaded successfully.',
            data: { parent, family, children }
        });
    });
    // POST /api/parent/children - Add new child profile
    // --- MODIFIED METHOD ---
    static addChild = safeController(async (req, res) => {
        const parentId = req.user.user_id;
        const { name, age, gender, needs, orphan_status, bform_no, // Destructure new required field
        class: childClass // Destructure new required field
         } = req.body;
        const parsedAge = parseInt(age, 10);
        // 1. Core Validation (Age, Name, Gender, Status, B-Form, Class)
        if (!name || !age || !gender || !orphan_status) {
            // Check essential fields
            return res.status(400).json({
                success: false,
                message: 'Missing required child fields: name, age, gender, and orphan_status.'
            });
        }
        if (!bform_no || bform_no.trim() === '') {
            return res.status(400).json({ success: false, message: 'B-Form Number is required.' });
        }
        if (!childClass || childClass.trim() === '') {
            return res.status(400).json({ success: false, message: 'Class/Grade is required.' });
        }
        // Age Check: must be between 1 and 18
        if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 18) {
            return res.status(400).json({ success: false, message: 'Child age must be between 1 and 18.' });
        }
        // 2. Family/Verification Checks
        const family = family_1.FamilyModel.getByParentId(parentId);
        if (!family) {
            return res.status(403).json({
                success: false,
                message: 'You must register your family first before adding children.'
            });
        }
        if (family.verification_status !== 'verified') {
            return res.status(403).json({
                success: false,
                message: 'Family application must be verified/approved before you can register children.'
            });
        }
        // 3. Prepare data for model
        const childData = {
            family_id: family.family_id,
            name,
            age: parsedAge, // Use the validated age
            gender,
            needs: needs || null,
            orphan_status: (orphan_status || 'none').toLowerCase().replace(' ', '_'),
            bform_no: bform_no.trim(), // Included required field
            class: childClass.trim(), // Included required field
        };
        // 4. Create child
        const newChild = childprofile_1.ChildProfileModel.create(childData);
        res.status(201).json({
            success: true,
            message: `${newChild.name} registered successfully.`,
            data: newChild
        });
    });
    // GET /api/parent/challans
    static getMyChallans = safeController(async (req, res) => {
        const parentId = req.user.user_id;
        const family = family_1.FamilyModel.getByParentId(parentId);
        if (!family) {
            return res.status(404).json({
                success: false,
                message: 'Family enrollment not found. Please register your family first.'
            });
        }
        // Get all children for this family
        const children = childprofile_1.ChildProfileModel.getByFamilyId(family.family_id);
        if (children.length === 0) {
            return res.json({
                success: true,
                message: 'No children registered yet.',
                challans: []
            });
        }
        // Get all challans for all children
        let allChallans = [];
        for (const child of children) {
            const childChallans = feechallan_1.FeeChallanModel.getByChildId(child.child_id);
            // Add child name to each challan for display
            const challansWithChildName = childChallans.map(challan => ({
                ...challan,
                child_name: child.name
            }));
            allChallans = allChallans.concat(challansWithChildName);
        }
        // Sort by date (most recent first)
        allChallans.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
        });
        res.json({
            success: true,
            message: 'Fee challans retrieved successfully.',
            challans: allChallans
        });
    });
    // PATCH /api/parent/challans/:challan_id/paid
    static markChallanPaid = safeController(async (req, res) => {
        const { challan_id } = req.params;
        const parentId = req.user.user_id;
        const challan = feechallan_1.FeeChallanModel.getById(challan_id);
        if (!challan) {
            return res.status(404).json({
                success: false,
                message: 'Challan not found.'
            });
        }
        // Verify the challan's child belongs to this parent's family
        const family = family_1.FamilyModel.getByParentId(parentId);
        if (!family) {
            return res.status(404).json({
                success: false,
                message: 'Family not found.'
            });
        }
        const child = childprofile_1.ChildProfileModel.getById(challan.child_id);
        if (!child || child.family_id !== family.family_id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to this challan.'
            });
        }
        if (challan.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Challan is already marked as paid.'
            });
        }
        feechallan_1.FeeChallanModel.markAsPaid(challan_id);
        const updatedChallan = feechallan_1.FeeChallanModel.getById(challan_id);
        res.json({
            success: true,
            message: `Challan ${challan_id} successfully marked as paid.`,
            data: updatedChallan
        });
    });
}
exports.ParentController = ParentController;
