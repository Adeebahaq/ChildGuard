"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
const express_1 = require("express");
// Your existing routes
const authRoutes_1 = __importDefault(require("./authRoutes"));
const caseReporterRoutes_1 = __importDefault(require("./caseReporterRoutes"));
const visitsRoutes_1 = __importDefault(require("./visitsRoutes"));
const volunteerRoutes_1 = __importDefault(require("./volunteerRoutes"));
const UserRoutes_1 = __importDefault(require("./UserRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const awarenessRoutes_1 = __importDefault(require("./awarenessRoutes"));
//(parent + family + children + challans + etc.)
const parentRoutes_1 = __importDefault(require("./parentRoutes"));
const familyroutes_1 = __importDefault(require("./familyroutes")); // or './familyRoutes' — keep your actual filename
const reportRoutes_1 = __importDefault(require("./reportRoutes"));
const childRoutes_1 = __importDefault(require("./childRoutes"));
const applicationRoutes_1 = __importDefault(require("./applicationRoutes"));
const challanRoutes_1 = __importDefault(require("./challanRoutes"));
const router = (0, express_1.Router)();
// Welcome Message — Updated & Professional
router.get('/', (req, res) => {
    res.json({
        message: "Welcome to ChildGuard API — Protecting Children Together",
        status: "Running",
        version: "1.0",
        documentation: "https://github.com/your-repo/childguard-api",
        endpoints: {
            // Authentication
            auth: "/api/auth",
            // Admin Panel
            admin: "/api/admin",
            awareness_content: "/api/awareness",
            // Volunteer System
            volunteer: "/volunteer",
            // Case Reporting & Visits
            case_reports: "/case",
            visits: "/visits",
            // User Management
            user: "/user",
            availability: "/availability",
            // Parent & Family System 
            parent_dashboard: "/parent/dashboard",
            parent_register_family: "/parent/register-family",
            parent_children: "/parent/children",
            parent_challans: "/parent/challans",
            // API Routes for Parent Module
            families: "/api/families",
            children: "/api/children",
            reports: "/api/reports",
            applications: "/api/applications",
            challans: "/api/challans",
        },
        team: "Made with love by You & Your Amazing Friend"
    });
});
// === MOUNT ALL ROUTES ===
router.use('/auth', authRoutes_1.default);
router.use('/case', caseReporterRoutes_1.default);
router.use('/visits', visitsRoutes_1.default);
router.use('/volunteer', volunteerRoutes_1.default);
router.use('/user', UserRoutes_1.default);
router.use('/availability', UserRoutes_1.default);
router.use('/api/admin', adminRoutes_1.default);
router.use('/api/awareness', awarenessRoutes_1.default);
router.use('/parent', parentRoutes_1.default);
router.use('/api/families', familyroutes_1.default);
router.use('/api/reports', reportRoutes_1.default);
router.use('/api/children', childRoutes_1.default);
router.use('/api/applications', applicationRoutes_1.default);
router.use('/api/challans', challanRoutes_1.default);
exports.default = router;
