// src/routes/index.ts

import { Router, Request, Response } from 'express';

const router = Router();
router.get('/', (req: Request, res: Response) => {
    res.json({
        message: "Welcome to the ChildGuard API!",
        status: "Running",
        version: "1.0",
        endpoints: {
            register: "/api/auth/register",
            login: "/api/auth/login",
            
        }
    });
});

export default router;