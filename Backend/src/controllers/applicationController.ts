// src/controllers/applicationController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { ApplicationModel } from '../models/Application';
import { ChildProfileModel } from '../models/childprofile';
import { FamilyModel } from '../models/family';

type ControllerHandler = (req: AuthRequest, res: Response) => Promise<Response | void>;

const safeController = (handler: ControllerHandler) => {
    return async (req: AuthRequest, res: Response) => {
        try {
            await handler(req, res);
        } catch (error: any) {
            console.error('Application Controller Error:', error);
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

export class ApplicationController {
    
    // GET /api/applications - Get all applications (admin only - view only)
    public static getAllApplications = safeController(async (req: AuthRequest, res: Response) => {
        const applications = ApplicationModel.findAll();
        
        // Enrich with child and family details
        const enrichedApplications = applications.map(app => {
            const child = ChildProfileModel.getById(app.child_id);
            const family = child ? FamilyModel.getById(child.family_id) : null;
            
            return {
                ...app,
                child_name: child?.name || 'Unknown',
                child_age: child?.age || 0,
                child_gender: child?.gender || 'Unknown',
                family_address: family?.address || 'Unknown',
                parent_name: family?.parent_name || 'Unknown',
            };
        });

        res.json({ success: true, data: { applications: enrichedApplications } });
    });

    // GET /api/applications/:application_id - Get one application with full details
    public static getApplication = safeController(async (req: AuthRequest, res: Response) => {
        const { application_id } = req.params;

        const application = ApplicationModel.findById(application_id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }

        // Get child and family details
        const child = ChildProfileModel.getById(application.child_id);
        const family = child ? FamilyModel.getById(child.family_id) : null;

        res.json({ 
            success: true, 
            data: { 
                application, 
                child,
                family 
            } 
        });
    });

    // GET /api/applications/child/:child_id - Get applications for a specific child
    public static getApplicationsByChild = safeController(async (req: AuthRequest, res: Response) => {
        const { child_id } = req.params;

        const child = ChildProfileModel.getById(child_id);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Child not found.' });
        }

        // Filter applications by child_id
        const allApplications = ApplicationModel.findAll();
        const applications = allApplications.filter(app => app.child_id === child_id);

        res.json({ success: true, data: { applications } });
    });
}