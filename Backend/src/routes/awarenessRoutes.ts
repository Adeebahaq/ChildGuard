// src/routes/awarenessRoutes.ts
import { Router } from 'express';
import { AwarenessContentModel } from '../models/AwarenessContent';

const router = Router();

// GET /api/awareness
// Public endpoint – returns only published awareness content (articles, videos, guides)
// Used by mobile app and parent dashboard
router.get('/', async (req, res) => {
  try {
    const contents = await AwarenessContentModel.getPublished();
    
    res.json({
      success: true,
      count: contents.length,
      data: contents,
    });
  } catch (error: any) {
    // Handle any database or server errors gracefully
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch awareness content',
    });
  }
});

export default router;