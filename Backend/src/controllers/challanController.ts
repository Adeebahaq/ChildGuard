// src/controllers/challanController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { FeeChallanModel } from '../models/feechallan';
import { ChildProfileModel } from '../models/childprofile';
import { FamilyModel } from '../models/family';
import { ApplicationModel } from '../models/Application';

type ControllerHandler = (req: AuthRequest, res: Response) => Promise<Response | void>;

const safeController = (handler: ControllerHandler) => {
    return async (req: AuthRequest, res: Response) => {
        try {
            await handler(req, res);
        } catch (error: any) {
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

export class ChallanController {
    
    // POST /api/challans/create - Parent creates/uploads fee challan
    public static createChallan = safeController(async (req: AuthRequest, res: Response) => {
        const parentId = req.user!.user_id;
        const { child_id, application_id, amount, challan_url } = req.body;

        if (!child_id || !application_id || !amount || !challan_url) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: child_id, application_id, amount, challan_url' 
            });
        }

        // Verify child exists
        const child = ChildProfileModel.getById(child_id);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Child not found.' });
        }

        // Verify parent owns this child
        const family = FamilyModel.getByParentId(parentId);
        if (!family || child.family_id !== family.family_id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized: You can only create challans for your own children.' 
            });
        }

        // Verify application exists
        const application = ApplicationModel.findById(application_id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        // Create challan
        const newChallan = FeeChallanModel.create({
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
    public static getChallan = safeController(async (req: AuthRequest, res: Response) => {
        const { challan_id } = req.params;

        const challan = FeeChallanModel.getById(challan_id);
        if (!challan) {
            return res.status(404).json({ success: false, message: 'Challan not found.' });
        }

        // Get child details
        const child = ChildProfileModel.getById(challan.child_id);

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
    public static verifyChallan = safeController(async (req: AuthRequest, res: Response) => {
        const { challan_id } = req.params;

        const challan = FeeChallanModel.getById(challan_id);
        if (!challan) {
            return res.status(404).json({ success: false, message: 'Challan not found.' });
        }

        if (challan.status === 'paid') {
            return res.status(400).json({ success: false, message: 'Challan already verified.' });
        }

        // Mark as paid (verified)
        FeeChallanModel.markAsPaid(challan_id);
        const updatedChallan = FeeChallanModel.getById(challan_id);

        res.json({ 
            success: true, 
            message: 'Fee challan verified successfully.', 
            data: updatedChallan 
        });
    });

    // GET /api/challans/child/:child_id - Get all challans for a child
    public static getChallansByChild = safeController(async (req: AuthRequest, res: Response) => {
        const { child_id } = req.params;

        const child = ChildProfileModel.getById(child_id);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Child not found.' });
        }

        const challans = FeeChallanModel.getByChildId(child_id);

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
    public static getAllChallans = safeController(async (req: AuthRequest, res: Response) => {
        // Get all applications and extract challans
        const allApplications = ApplicationModel.findAll();
        let allChallans: any[] = [];

        for (const app of allApplications) {
            const challans = FeeChallanModel.getByApplication(app.application_id);
            allChallans = allChallans.concat(challans);
        }

        // Enrich with child details
        const enrichedChallans = allChallans.map(challan => {
            const child = ChildProfileModel.getById(challan.child_id);
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