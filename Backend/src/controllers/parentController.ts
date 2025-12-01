// src/controllers/parentController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware'; 
import { ParentModel } from '../models/parents'; 
import { FamilyModel } from '../models/family';
import { ChildProfileModel, ChildProfile } from '../models/childprofile'; 
import { FeeChallanModel } from '../models/feechallan';

type ControllerHandler = (req: AuthRequest, res: Response) => Promise<Response | void>;

const safeController = (handler: ControllerHandler) => {
    return async (req: AuthRequest, res: Response) => {
        try {
            await handler(req, res); 
        } catch (error: any) {
            console.error('Controller Error:', error);
            const errorMessage = error.message || 'An unexpected server error occurred.';
            
            if (!res.headersSent) {
                let statusCode = 500;
                
                // Adjusting status code determination for better error handling
                if (errorMessage.includes('not found')) {
                    statusCode = 404;
                } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('permission')) {
                    statusCode = 403; 
                } else if (
                    errorMessage.includes('required') || 
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

export class ParentController {
    
    // POST /api/parent/register-family
    public static registerFamily = safeController(async (req: AuthRequest, res: Response) => {
        const parentId = req.user!.user_id;
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
        const existingFamily = FamilyModel.getByParentId(parentId);
        if (existingFamily) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already registered a family application.' 
            });
        }

        // Check if CNIC is already registered
        const existingCnic = ParentModel.db.prepare(`
            SELECT parent_id FROM parents WHERE cnic = ? AND parent_id != ?
        `).get(cnicDigits, parentId);

        if (existingCnic) {
            return res.status(400).json({ 
                success: false, 
                message: 'This CNIC is already registered with another account.' 
            });
        }

        // 1. Update parent's phone, address, and CNIC
        const updateParent = ParentModel.db.prepare(`
            UPDATE parents 
            SET phone = ?, address = ?, cnic = ?
            WHERE parent_id = ?
        `);
        updateParent.run(phoneDigits, address, cnicDigits, parentId);

        // 2. Create family with same address
        const newFamily = FamilyModel.create({
            parent_id: parentId,
            income: parseInt(income, 10),
            address,
            proof_documents: Array.isArray(proof_documents) ? proof_documents : [],
        });

        // 3. Get updated parent info
        const updatedParent = ParentModel.find(parentId);

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
    public static getMyFullProfile = safeController(async (req: AuthRequest, res: Response) => {
        const parentId = req.user!.user_id;
        
        const parent = ParentModel.find(parentId);
        if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent profile not found.' });
        }

        const family = FamilyModel.getByParentId(parentId) || null;
        
        let children: ChildProfile[] = [];
        
        if (family) {
            children = ChildProfileModel.getByFamilyId(family.family_id);
        }

        res.json({ 
            success: true, 
            message: 'Profile loaded successfully.', 
            data: { parent, family, children } 
        });
    });

    // POST /api/parent/children - Add new child profile
    // --- MODIFIED METHOD ---
    public static addChild = safeController(async (req: AuthRequest, res: Response) => {
        const parentId = req.user!.user_id;
        const { 
            name, 
            age, 
            gender, 
            needs, 
            orphan_status,
            bform_no, // Destructure new required field
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
        const family = FamilyModel.getByParentId(parentId);
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
            class: childClass.trim(),  // Included required field
        };

        // 4. Create child
        const newChild = ChildProfileModel.create(childData);
        
        res.status(201).json({ 
            success: true, 
            message: `${newChild.name} registered successfully.`, 
            data: newChild 
        });
    });

    // GET /api/parent/challans
    public static getMyChallans = safeController(async (req: AuthRequest, res: Response) => {
        const parentId = req.user!.user_id;
        
        const family = FamilyModel.getByParentId(parentId);
        if (!family) {
            return res.status(404).json({ 
                success: false, 
                message: 'Family enrollment not found. Please register your family first.' 
            });
        }

        // Get all children for this family
        const children = ChildProfileModel.getByFamilyId(family.family_id);
        
        if (children.length === 0) {
            return res.json({ 
                success: true, 
                message: 'No children registered yet.', 
                challans: [] 
            });
        }

        // Get all challans for all children
        let allChallans: any[] = [];
        for (const child of children) {
            const childChallans = FeeChallanModel.getByChildId(child.child_id);
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
    public static markChallanPaid = safeController(async (req: AuthRequest, res: Response) => {
        const { challan_id } = req.params;
        const parentId = req.user!.user_id;

        const challan = FeeChallanModel.getById(challan_id);
        if (!challan) {
            return res.status(404).json({ 
                success: false, 
                message: 'Challan not found.' 
            });
        }

        // Verify the challan's child belongs to this parent's family
        const family = FamilyModel.getByParentId(parentId);
        if (!family) {
            return res.status(404).json({ 
                success: false, 
                message: 'Family not found.' 
            });
        }

        const child = ChildProfileModel.getById(challan.child_id);
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
        
        FeeChallanModel.markAsPaid(challan_id);
        const updatedChallan = FeeChallanModel.getById(challan_id);

        res.json({ 
            success: true, 
            message: `Challan ${challan_id} successfully marked as paid.`, 
            data: updatedChallan 
        });
    });
}