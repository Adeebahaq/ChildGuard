// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_jwt_secret'; 


interface AuthPayload {
    user_id: string;
    role: string;
}


export interface AuthRequest extends Request {
   
    user?: AuthPayload; 
}

export const authMiddleware = (
    req: AuthRequest, 
    res: Response, 
    next: NextFunction
) => {
    
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Token format is "Bearer [token]"' });
    }

    try {
        
        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;

        
        req.user = decoded; 

        next(); 
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

//// Admin-only guard
export const requireAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};