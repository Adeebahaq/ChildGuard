// src/routes/index.ts
import { Router } from 'express';

// Your existing routes
import authRoutes from './authRoutes';
import caseReporterRoutes from './caseReporterRoutes';
import visitsRoutes from './visitsRoutes';
import volunteerRoutes from './volunteerRoutes';
import userRoutes from './UserRoutes';
import adminRoutes from './adminRoutes';
import awarenessRoutes from './awarenessRoutes';

//(parent + family + children + challans + etc.)
import parentRoutes from './parentRoutes';
import familyRoutes from './familyroutes';        // or './familyRoutes' — keep your actual filename
import reportRoutes from './reportRoutes';
import childRoutes from './childRoutes';
import applicationRoutes from './applicationRoutes';
import challanRoutes from './challanRoutes';

const router = Router();

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

router.use('/auth', authRoutes);
router.use('/case', caseReporterRoutes);
router.use('/visits', visitsRoutes);
router.use('/volunteer', volunteerRoutes);
router.use('/user', userRoutes);
router.use('/availability', userRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/awareness', awarenessRoutes);

router.use('/parent', parentRoutes);
router.use('/api/families', familyRoutes);
router.use('/api/reports', reportRoutes);
router.use('/api/children', childRoutes);
router.use('/api/applications', applicationRoutes);
router.use('/api/challans', challanRoutes);

export default router;