"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallanController = void 0;
const feechallan_1 = require("../models/feechallan");
const childprofile_1 = require("../models/childprofile");
const family_1 = require("../models/family");
const Application_1 = require("../models/Application");
const safeController = (handler) => {
    return async (req, res) => {
        try {
            await handler(req, res);
        }
        catch (error) {
            console.error('Challan Controller Error:', error);
            const errorMessage = error.message || 'An unexpected server error occurred.';
            if (!res.headersSent) {
                const statusCode = errorMessage.includes('not found') ? 404 : 500;
                res.status(statusCode).json({
                    success: false,
                    message: errorMessage,
                });
            }
        }
    };
};
class ChallanController {
    // POST /api/challans/create - Parent creates/uploads fee challan
    static createChallan = safeController(async (req, res) => {
        const parentId = req.user.user_id;
        const { child_id, application_id, amount, challan_url } = req.body;
        if (!child_id || !application_id || !amount || !challan_url) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: child_id, application_id, amount, challan_url'
            });
        }
        // Verify child exists
        const child = childprofile_1.ChildProfileModel.getById(child_id);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Child not found.' });
        }
        // Verify parent owns this child
        const family = family_1.FamilyModel.getByParentId(parentId);
        if (!family || child.family_id !== family.family_id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only create challans for your own children.'
            });
        }
        // Verify application exists
        const application = Application_1.ApplicationModel.findById(application_id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }
        // Create challan
        const newChallan = feechallan_1.FeeChallanModel.create({
            application_id,
            child_id,
            amount: parseFloat(amount),
            challan_url,
        });
        res.status(201).json({
            success: true,
            message: 'Fee challan uploaded successfully. Awaiting verification.',
            data: newChallan
        });
    });
    // GET /api/challans/:challan_id - Get challan by ID
    static getChallan = safeController(async (req, res) => {
        const { challan_id } = req.params;
        const challan = feechallan_1.FeeChallanModel.getById(challan_id);
        if (!challan) {
            return res.status(404).json({ success: false, message: 'Challan not found.' });
        }
        // Get child details
        const child = childprofile_1.ChildProfileModel.getById(challan.child_id);
        res.json({
            success: true,
            data: {
                challan,
                child_name: child?.name || 'Unknown',
                child_age: child?.age || 0,
            }
        });
    });
    // PATCH /api/challans/:challan_id/verify - Admin verifies challan
    static verifyChallan = safeController(async (req, res) => {
        const { challan_id } = req.params;
        const challan = feechallan_1.FeeChallanModel.getById(challan_id);
        if (!challan) {
            return res.status(404).json({ success: false, message: 'Challan not found.' });
        }
        if (challan.status === 'paid') {
            return res.status(400).json({ success: false, message: 'Challan already verified.' });
        }
        // Mark as paid (verified)
        feechallan_1.FeeChallanModel.markAsPaid(challan_id);
        const updatedChallan = feechallan_1.FeeChallanModel.getById(challan_id);
        res.json({
            success: true,
            message: 'Fee challan verified successfully.',
            data: updatedChallan
        });
    });
    // GET /api/challans/child/:child_id - Get all challans for a child
    static getChallansByChild = safeController(async (req, res) => {
        const { child_id } = req.params;
        const child = childprofile_1.ChildProfileModel.getById(child_id);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Child not found.' });
        }
        const challans = feechallan_1.FeeChallanModel.getByChildId(child_id);
        res.json({
            success: true,
            data: {
                challans,
                child_name: child.name,
                total_challans: challans.length,
            }
        });
    });
    // GET /api/challans - Get all challans (admin only)
    static getAllChallans = safeController(async (req, res) => {
        // Get all applications and extract challans
        const allApplications = Application_1.ApplicationModel.findAll();
        let allChallans = [];
        for (const app of allApplications) {
            const challans = feechallan_1.FeeChallanModel.getByApplication(app.application_id);
            allChallans = allChallans.concat(challans);
        }
        // Enrich with child details
        const enrichedChallans = allChallans.map(challan => {
            const child = childprofile_1.ChildProfileModel.getById(challan.child_id);
            return {
                ...challan,
                child_name: child?.name || 'Unknown',
                child_age: child?.age || 0,
            };
        });
        res.json({
            success: true,
            data: {
                challans: enrichedChallans,
                total: enrichedChallans.length,
            }
        });
    });
}
exports.ChallanController = ChallanController;
