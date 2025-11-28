// src/controllers/adminController.ts
import { Response } from 'express';
import { AwarenessContentModel } from '../models/AwarenessContent';
import { AuthRequest } from '../middleware/authMiddleware';

// Create new awareness content (admin only)
export const createAwarenessContent = async (req: AuthRequest, res: Response) => {
  const admin_id = req.user!.user_id;
  const { title, content, type, status } = req.body;

  // Validate required fields
  if (!title || !content || !type) {
    return res.status(400).json({ success: false, message: 'title, content, and type are required' });
  }

  // Validate type
  if (!['article', 'video', 'guide'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid type. Must be article, video, or guide' });
  }

  try {
    const newContent = await AwarenessContentModel.create({
      admin_id,
      title,
      content,
      type: type as 'article' | 'video' | 'guide',
      status: status as 'draft' | 'published' | undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Awareness content created successfully',
      data: newContent,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all awareness content including drafts (admin panel only)
export const getAllAwarenessContents = async (_req: any, res: Response) => {
  try {
    const contents = await AwarenessContentModel.getAll();
    res.json({ success: true, data: contents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update existing awareness content
export const updateAwarenessContent = async (req: AuthRequest, res: Response) => {
  const { content_id } = req.params;
  const updates = req.body;

  try {
    const updated = await AwarenessContentModel.update(content_id, updates);
    res.json({ success: true, message: 'Content updated successfully', data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete awareness content by ID
export const deleteAwarenessContent = async (req: AuthRequest, res: Response) => {
  const { content_id } = req.params;

  try {
    const deleted = await AwarenessContentModel.delete(content_id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};