"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/awarenessRoutes.ts
const express_1 = require("express");
const AwarenessContent_1 = require("../models/AwarenessContent");
const router = (0, express_1.Router)();
// GET /api/awareness
// Public endpoint – returns only published awareness content (articles, videos, guides)
// Used by mobile app and parent dashboard
router.get('/', async (req, res) => {
    try {
        const contents = await AwarenessContent_1.AwarenessContentModel.getPublished();
        res.json({
            success: true,
            count: contents.length,
            data: contents,
        });
    }
    catch (error) {
        // Handle any database or server errors gracefully
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch awareness content',
        });
    }
});
exports.default = router;
