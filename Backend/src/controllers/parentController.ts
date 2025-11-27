import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware'; 
// NOTE: Ensure these paths are correct for your models
import { ParentModel } from '../models/parents'; 
import { FamilyModel } from '../models/family';
// FIX: Import the actual ChildProfile type from your model file
import { ChildProfileModel, ChildProfile } from '../models/childprofile'; 
import { FeeChallanModel } from '../models/feechallan';

// --- PLACEHOLDER FOR CHILDPROFILE TYPE ---
// FIX: This section is removed as we now rely on the imported type.
// If your ChildProfile model file exports ChildProfileModel but not ChildProfile, 
// you would need to adjust the import line above to get the type correctly.
// --- END PLACEHOLDER ---


// The inner handler type, allowing controllers to return a Response (for early exits) or nothing.
type ControllerHandler = (req: AuthRequest, res: Response) => Promise<Response | void>;

const safeController = (handler: ControllerHandler) => {
    // This is the function Express runs, which must return Promise<void>
    return async (req: AuthRequest, res: Response) => {
        try {
            await handler(req, res); 
        } catch (error: any) {
            console.error('Controller Error:', error);
            const errorMessage = error.message || 'An unexpected server error occurred.';
            
            // Check if headers have already been sent to prevent crashing on error handling
            if (!res.headersSent) {
                const statusCode = (
                    errorMessage.includes('not found') || 
                    errorMessage.includes('required') || 
                    errorMessage.includes('already registered') ||
                    errorMessage.includes('must be verified')
                ) ? 400 : 500;
                
                res.status(statusCode).json({
                    success: false,
                    message: errorMessage,
                });
            }
        }
    };
};

export class ParentController {
    
    // POST /api/parent/register-family
    public static registerFamily = safeController(async (req: AuthRequest, res: Response) => {
        const parentId = req.user!.user_id;
        const { income, address, proof_documents } = req.body;

        if (!income || !address) {
            return res.status(400).json({ success: false, message: 'Missing required fields: income and address.' });
        }
        
        const existingFamily = FamilyModel.getByParentId(parentId);
        if (existingFamily) {
             return res.status(400).json({ success: false, message: 'You have already registered a family application.' });
        }

        const newFamily = FamilyModel.create({
            parent_id: parentId,
            income: parseInt(income, 10),
            address,
            proof_documents: Array.isArray(proof_documents) ? proof_documents : [],
        });

        res.status(201).json({ success: true, message: 'Family application submitted successfully for verification.', data: newFamily });
    });

    // GET /api/parent/profile
    public static getMyFullProfile = safeController(async (req: AuthRequest, res: Response) => {
        const parentId = req.user!.user_id;
        
        const parent = ParentModel.find(parentId);
        if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent profile not found.' });
        }

        const family = FamilyModel.getByParentId(parentId) || null;
        
        // The type for children now correctly points to the imported ChildProfile type
        let children: ChildProfile[] = [];
        
        if (family) {
            children = ChildProfileModel.getByFamilyId(family.family_id);
        }

        res.json({ success: true, message: 'Profile loaded successfully.', data: { parent, family, children } });
    });


    // POST /api/parent/children
    public static addChild = safeController(async (req: AuthRequest, res: Response) => {
        const parentId = req.user!.user_id;
        const { name, age, gender, needs, orphan_status } = req.body;

        if (!name || !age || !gender || !orphan_status) {
            return res.status(400).json({ success: false, message: 'Missing required child fields.' });
        }

        const family = FamilyModel.getByParentId(parentId);
        if (!family || family.verification_status !== 'verified') {
            return res.status(403).json({ success: false, message: 'Family application must be verified/approved to register children.' });
        }

        // 1. Create the child profile
        const newChild = ChildProfileModel.create({
            family_id: family.family_id,
            name,
            age: parseInt(age, 10),
            gender,
            needs,
            orphan_status: orphan_status.toLowerCase().replace(' ', '_'), 
        });
        
        // 2. Update the family's child count
        const currentChildren = ChildProfileModel.getByFamilyId(family.family_id);
        FamilyModel.updateChildrenCount(family.family_id, currentChildren.length);
        
        res.status(201).json({ success: true, message: `${newChild.name} registered successfully.`, data: newChild });
    });

    // GET /api/parent/challans
    public static getMyChallans = safeController(async (req: AuthRequest, res: Response) => {
        const parentId = req.user!.user_id;
        
        const family = FamilyModel.getByParentId(parentId);
        if (!family) {
            return res.status(404).json({ success: false, message: 'Family enrollment not found.' });
        }
        const challans = FeeChallanModel.getByApplication(family.family_id);
        res.json({ success: true, message: 'Fee challans retrieved successfully.', data: { challans } });
    });

    // PATCH /api/parent/challans/:challan_id/paid
    public static markChallanPaid = safeController(async (req: AuthRequest, res: Response) => {
        const { challan_id } = req.params;
        const parentId = req.user!.user_id;

        const challan = FeeChallanModel.getById(challan_id);
        if (!challan) {
            return res.status(404).json({ success: false, message: 'Challan not found.' });
        }

        const family = FamilyModel.getByParentId(parentId);
        if (!family || family.family_id !== challan.application_id) {
             return res.status(403).json({ success: false, message: 'Unauthorized access to this challan.' });
        }

        if (challan.status === 'paid') {
             return res.status(400).json({ success: false, message: 'Challan is already marked as paid.' });
        }
        
        FeeChallanModel.markAsPaid(challan_id);
        const updatedChallan = FeeChallanModel.getById(challan_id);

        res.json({ success: true, message: `Challan ${challan_id} successfully marked as paid.`, data: updatedChallan });
    });
}