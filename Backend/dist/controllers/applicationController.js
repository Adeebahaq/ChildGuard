"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationController = void 0;
const Application_1 = require("../models/Application");
const childprofile_1 = require("../models/childprofile");
const family_1 = require("../models/family");
const safeController = (handler) => {
    return async (req, res) => {
        try {
            await handler(req, res);
        }
        catch (error) {
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
class ApplicationController {
    // GET /api/applications - Get all applications (admin only - view only)
    static getAllApplications = safeController(async (req, res) => {
        const applications = Application_1.ApplicationModel.findAll();
        // Enrich with child and family details
        const enrichedApplications = applications.map(app => {
            const child = childprofile_1.ChildProfileModel.getById(app.child_id);
            const family = child ? family_1.FamilyModel.getById(child.family_id) : null;
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
    static getApplication = safeController(async (req, res) => {
        const { application_id } = req.params;
        const application = Application_1.ApplicationModel.findById(application_id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found.' });
        }
        // Get child and family details
        const child = childprofile_1.ChildProfileModel.getById(application.child_id);
        const family = child ? family_1.FamilyModel.getById(child.family_id) : null;
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
    static getApplicationsByChild = safeController(async (req, res) => {
        const { child_id } = req.params;
        const child = childprofile_1.ChildProfileModel.getById(child_id);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Child not found.' });
        }
        // Filter applications by child_id
        const allApplications = Application_1.ApplicationModel.findAll();
        const applications = allApplications.filter(app => app.child_id === child_id);
        res.json({ success: true, data: { applications } });
    });
}
exports.ApplicationController = ApplicationController;
