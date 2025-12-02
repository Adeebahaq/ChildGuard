// src/controllers/parentController.ts
import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/authMiddleware'; 
import { ParentModel } from '../models/parent'; 
import { FamilyModel } from '../models/family';
import { ChildProfileModel, ChildProfile } from '../models/childprofile'; 
import { FeeChallanModel } from '../models/feechallan';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ---------------- Multer setup ----------------
const uploadDir = path.join(__dirname, '../../public/docs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = file.originalname.replace(ext, '');
        cb(null, `${name}-${Date.now()}${ext}`);
    },
});

const upload = multer({ storage }).array('proof_documents', 5); // max 5 files

// Helper to handle Multer upload as a promise
const handleFileUpload = (req: AuthRequest, res: Response) => {
    return new Promise<Express.Multer.File[]>((resolve, reject) => {
        upload(req as unknown as Request, res as Response, (err: any) => {
            if (err) reject(err);
            else resolve((req as any).files || []);
        });
    });
};
// Add this to src/controllers/parentController.ts

const challanUploadDir = path.join(__dirname, '../../public/challans');
if (!fs.existsSync(challanUploadDir)) fs.mkdirSync(challanUploadDir, { recursive: true });

const challanStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, challanUploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = file.originalname.replace(ext, '');
        cb(null, `challan-${name}-${Date.now()}${ext}`);
    },
});

const challanUpload = multer({ 
    storage: challanStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG are allowed.'));
        }
    }
}).single('challan_file');

// Helper to handle challan file upload as a promise
const handleChallanFileUpload = (req: AuthRequest, res: Response) => {
    return new Promise<Express.Multer.File | undefined>((resolve, reject) => {
        challanUpload(req as unknown as Request, res as Response, (err: any) => {
            if (err) reject(err);
            else resolve((req as any).file);
        });
    });
};
// ---------------- Safe Controller ----------------
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
                if (errorMessage.includes('not found')) statusCode = 404;
                else if (errorMessage.includes('Unauthorized') || errorMessage.includes('permission')) statusCode = 403;
                else if (
                    errorMessage.includes('required') || 
                    errorMessage.includes('must be between') || 
                    errorMessage.includes('already registered') ||
                    errorMessage.includes('must be verified')
                ) statusCode = 400;

                res.status(statusCode).json({ success: false, message: errorMessage });
            }
        }
    };
};

// ---------------- Controller ----------------
export class ParentController {

    // POST /api/parent/register-family
    public static registerFamily = safeController(async (req: AuthRequest, res: Response) => {
        const parentId = req.user!.user_id;

        // Handle file upload
        const files = await handleFileUpload(req, res);

        const { income, address, phone, cnic } = req.body;

        // Validate required fields
        if (!income || !address || !phone || !cnic) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: income, address, phone, and CNIC are required.' 
            });
        }

        // CNIC validation
        const cnicDigits = cnic.replace(/\D/g, '');
        if (cnicDigits.length !== 13) {
            return res.status(400).json({ success: false, message: 'CNIC must be exactly 13 digits.' });
        }

        // Phone validation
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length !== 11) {
            return res.status(400).json({ success: false, message: 'Phone number must be exactly 11 digits.' });
        }

        // Check if family exists
        const existingFamily = FamilyModel.getByParentId(parentId);
        if (existingFamily) {
            return res.status(400).json({ success: false, message: 'You have already registered a family application.' });
        }

        // Check duplicate CNIC
        const existingCnic = ParentModel.db.prepare(`
            SELECT parent_id FROM parents WHERE cnic = ? AND parent_id != ?
        `).get(cnicDigits, parentId);

        if (existingCnic) {
            return res.status(400).json({ success: false, message: 'This CNIC is already registered with another account.' });
        }

        // Update parent info
        ParentModel.db.prepare(`
            UPDATE parents SET phone = ?, address = ?, cnic = ? WHERE parent_id = ?
        `).run(phoneDigits, address, cnicDigits, parentId);

        // Prepare uploaded file paths
        const proof_documents = files.map(file => file.filename);

        // Create family
        const newFamily = FamilyModel.create({
            parent_id: parentId,
            income: parseInt(income, 10),
            address,
            proof_documents
        });

        const updatedParent = ParentModel.find(parentId);

        res.status(201).json({ 
            success: true, 
            message: 'Family application submitted successfully for verification.', 
            data: { family: newFamily, parent: updatedParent }
        });
    });

    // ... rest of your controller methods (getMyFullProfile, addChild, getMyChallans, markChallanPaid) remain unchanged



    // GET /api/parent/profile
    public static getMyFullProfile = safeController(async (req: AuthRequest, res: Response) => {
        const parentId = req.user!.user_id;
        
        const parent = ParentModel.find(parentId);
        if (!parent) {
            return res.status(404).json({ success: false, message: 'Parent profile not found.' });
        }

      const family = FamilyModel.getByParentId(parentId) || null;

let children: ChildProfile[] = [];
let childrenCount = 0;

if (family) {
    children = ChildProfileModel.getByFamilyId(family.family_id);
    childrenCount = children.length; // count actual children
}

res.json({ 
    success: true, 
    message: 'Profile loaded successfully.', 
    data: { 
        parent, 
        family: { ...family, children_count: childrenCount }, // include actual count
        children 
    } 
});

    });

    // POST /api/parent/children - Add new child profile
    // --- MODIFIED METHOD ---
   // POST /api/parent/children - Add new child profile
public static addChild = safeController(async (req: AuthRequest, res: Response) => {
    const parentId = req.user!.user_id;
    const { 
        name, 
        age, 
        gender, 
        needs, 
        orphan_status,
        bform_no,
        class: childClass
    } = req.body;

    const parsedAge = parseInt(age, 10);

    // --- Validation ---
    if (!name || !age || !gender || !orphan_status) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required child fields: name, age, gender, and orphan_status.' 
        });
    }

    if (!bform_no || !childClass) {
        return res.status(400).json({ success: false, message: 'B-Form Number and Class/Grade are required.' });
    }

    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 18) {
        return res.status(400).json({ success: false, message: 'Child age must be between 1 and 18.' });
    }

    // --- Family Check ---
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

    // --- Create Child ---
    const childData = {
        family_id: family.family_id,
        name,
        age: parsedAge,
        gender,
        needs: needs || null,
        orphan_status: orphan_status.toLowerCase().replace(' ', '_'),
        bform_no: bform_no.trim(),
        class: childClass.trim(),
    };

    const newChild = ChildProfileModel.create(childData);

    // -----------------------------
    // ⭐ NEW: Create application row
    // -----------------------------
    const application_id = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    ParentModel.db.prepare(`
        INSERT INTO applications (
            application_id,
            child_id,
            sponsor_id,
            status,
            applied_at
        ) VALUES (?, ?, NULL, 'verified', datetime('now'))
    `).run(application_id, newChild.child_id);

    // --- Get Updated Children Count ---
    const children = ChildProfileModel.getByFamilyId(family.family_id);
    const children_count = children.length;

    // --- Respond ---
    res.status(201).json({ 
        success: true, 
        message: `${newChild.name} registered successfully. Application created automatically.`,
        data: { 
            newChild,
            children_count,
            application: {
                application_id,
                child_id: newChild.child_id,
                status: "verified",
                sponsor_id: null
            }
        }
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

// GET /api/parent/myChildren
// GET /api/parent/myChildren
public static getMyChildren = safeController(async (req: AuthRequest, res: Response) => {
    const parentId = req.user!.user_id;

    const family = FamilyModel.getByParentId(parentId);
    if (!family) {
        return res.json({ success: true, children: [] });
    }

    const children = ChildProfileModel.getByFamilyId(family.family_id);

    const childrenWithStatus = children.map((child) => {
        const app = ParentModel.db
            .prepare(`SELECT status FROM applications WHERE child_id = ?`)
            .get(child.child_id) as { status?: string } | undefined;

        return { ...child, status: app?.status === "verified" ? "sponsored" : "not_sponsored" };
    });

    res.json({ success: true, children: childrenWithStatus });
});

// POST /api/parent/fee-challan/:child_id - Upload fee challan for a child
public static uploadFeeChallan = safeController(async (req: AuthRequest, res: Response) => {
    const parentId = req.user!.user_id;
    const { child_id } = req.params;
    
    // Handle file upload first
    let uploadedFile: Express.Multer.File | undefined;
    try {
        uploadedFile = await handleChallanFileUpload(req, res);
    } catch (uploadError: any) {
        return res.status(400).json({ 
            success: false, 
            message: uploadError.message || 'File upload failed' 
        });
    }

    if (!uploadedFile) {
        return res.status(400).json({ 
            success: false, 
            message: 'No challan file uploaded' 
        });
    }

    const { amount, issued_at, due_date } = req.body;

    // Validate required fields
    if (!amount || !issued_at || !due_date) {
        // Delete uploaded file if validation fails
        fs.unlinkSync(uploadedFile.path);
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: amount, issued_at, and due_date are required.' 
        });
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        fs.unlinkSync(uploadedFile.path);
        return res.status(400).json({ 
            success: false, 
            message: 'Amount must be a positive number.' 
        });
    }

    // Validate dates
    const issuedDate = new Date(issued_at);
    const dueDate = new Date(due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (issuedDate > today) {
        fs.unlinkSync(uploadedFile.path);
        return res.status(400).json({ 
            success: false, 
            message: 'Issued date cannot be in the future.' 
        });
    }

    if (dueDate < issuedDate) {
        fs.unlinkSync(uploadedFile.path);
        return res.status(400).json({ 
            success: false, 
            message: 'Due date must be after issued date.' 
        });
    }

    // Verify child exists
    const child = ChildProfileModel.getById(child_id);
    if (!child) {
        fs.unlinkSync(uploadedFile.path);
        return res.status(404).json({ 
            success: false, 
            message: 'Child not found.' 
        });
    }

    // Verify parent owns this child
    const family = FamilyModel.getByParentId(parentId);
    if (!family || child.family_id !== family.family_id) {
        fs.unlinkSync(uploadedFile.path);
        return res.status(403).json({ 
            success: false, 
            message: 'Unauthorized: You can only upload challans for your own children.' 
        });
    }

    // Get or verify application exists
    const application = ParentModel.db
        .prepare(`SELECT * FROM applications WHERE child_id = ?`)
        .get(child_id) as any;

    if (!application) {
        fs.unlinkSync(uploadedFile.path);
        return res.status(404).json({ 
            success: false, 
            message: 'No application found for this child. Please contact support.' 
        });
    }

    // Create challan URL (relative path for storage)
    const challan_url = `/challans/${uploadedFile.filename}`;

    // Create challan in database
    const newChallan = FeeChallanModel.create({
        application_id: application.application_id,
        child_id: child_id,
        amount: parsedAmount,
        challan_url: challan_url,
    });

    // Add issued_at and due_date to the challan
    ParentModel.db.prepare(`
        UPDATE fee_challans 
        SET issued_at = ?, due_date = ?
        WHERE challan_id = ?
    `).run(issued_at, due_date, newChallan.challan_id);

    const updatedChallan = FeeChallanModel.getById(newChallan.challan_id);

    res.status(201).json({ 
        success: true, 
        message: 'Fee challan uploaded successfully. Awaiting verification.', 
        data: {
            challan: updatedChallan,
            child_name: child.name,
            file_name: uploadedFile.filename
        }
    });
});



// GET /api/parent/fee-challan/:child_id - Get fee challan history for a specific child
public static getChildChallanHistory = safeController(async (req: AuthRequest, res: Response) => {
    const parentId = req.user!.user_id;
    const { child_id } = req.params;

    // Verify child exists
    const child = ChildProfileModel.getById(child_id);
    if (!child) {
        return res.status(404).json({ 
            success: false, 
            message: 'Child not found.' 
        });
    }

    // Verify parent owns this child
    const family = FamilyModel.getByParentId(parentId);
    if (!family || child.family_id !== family.family_id) {
        return res.status(403).json({ 
            success: false, 
            message: 'Unauthorized: You can only view challans for your own children.' 
        });
    }

    // Get all challans for this child
    const challans = FeeChallanModel.getByChildId(child_id);

    // Sort by created_at (most recent first)
    challans.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
    });

    res.json({ 
        success: true, 
        message: 'Challan history retrieved successfully.', 
        data: {
            child_name: child.name,
            child_id: child.child_id,
            challans: challans,
            total_paid: challans.reduce((sum, c) => sum + c.amount, 0),
            total_challans: challans.length
        }
    });
});

}