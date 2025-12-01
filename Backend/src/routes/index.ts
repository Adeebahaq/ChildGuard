// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './authRoutes';
import parentRoutes from './parentRoutes';
import familyRoutes from './familyroutes';
import reportRoutes from './reportRoutes';
import awarenessRoutes from './awarenessRoutes';
import caseReporterRoutes from './caseReporterRoutes';
import userRoutes from './UserRoutes';
import visitsRoutes from './visitsRoutes';
import volunteerRoutes from './volunteerRoutes';
import childRoutes from './childRoutes';
import applicationRoutes from './applicationRoutes';
import challanRoutes from './challanRoutes';

const router = Router();

// Welcome endpoint
router.get('/', (req, res) => {
    res.json({
        message: "Welcome to the ChildGuard API!",
        status: "Running",
        version: "1.0",
        endpoints: {
            auth: "/api/auth",
            parent: "/api/parent",
            families: "/api/families",  // UPDATED
            reports: "/api/reports",
            awareness: "/api/awareness",
            caseReporter: "/api/case-reporter",
            user: "/api/user",
            visits: "/api/visits",
            volunteer: "/api/volunteer",
            children: "/api/children",
            applications: "/api/applications",
            challans: "/api/challans"
        }
    });
});

// Register all route modules
router.use('/auth', authRoutes);
router.use('/parent', parentRoutes);
router.use('/families', familyRoutes);  // FIXED: Changed from '/family' to '/families'
router.use('/reports', reportRoutes);
router.use('/awareness', awarenessRoutes);
router.use('/case-reporter', caseReporterRoutes);
router.use('/user', userRoutes);
router.use('/visits', visitsRoutes);
router.use('/volunteer', volunteerRoutes);
router.use('/children', childRoutes);
router.use('/applications', applicationRoutes);
router.use('/challans', challanRoutes);

export default router;