// src/controllers/adminController.ts
import { Response } from 'express';
import { AwarenessContentModel } from '../models/AwarenessContent';
import { AuthRequest } from '../middleware/authMiddleware';
import { AdminModel } from '../models/admin';
import { VolunteerModel } from '../models/volunteer';

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

// Get all volunteers (admin only) ←←← UPDATED: Now 100% works with your frontend
export const getAllVolunteers = async (_req: any, res: Response) => {
  try {
    const volunteers = await AdminModel.getAllVolunteers();

    // ←←← FIX: Ensure null/undefined fields don't break JSON.parse on frontend
    const sanitized = volunteers.map(v => ({
      volunteer_id: v.volunteer_id,
      phone: v.phone ?? null,
      area: v.area ?? null,
      age: v.age ?? null,
      availability: v.availability ?? null,
      status: v.status ?? 'pending',
    }));

    res.json({ success: true, data: sanitized });
  } catch (error: any) {
    console.error('Error in getAllVolunteers:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Get requested volunteers (admin only) ←←← ALSO FIXED
export const getRequestedVolunteers = async (_req: any, res: Response) => {
  try {
    const volunteers = await AdminModel.getRequestedVolunteers();

    const sanitized = volunteers.map(v => ({
      volunteer_id: v.volunteer_id,
      phone: v.phone ?? null,
      area: v.area ?? null,
      age: v.age ?? null,
      availability: v.availability ?? null,
      status: v.status ?? 'pending',
    }));

    res.json({ success: true, data: sanitized });
  } catch (error: any) {
    console.error('Error in getRequestedVolunteers:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Get volunteer by ID (admin only)
export const getVolunteerById = async (req: AuthRequest, res: Response) => {
  const { volunteer_id } = req.params;
  try {
    const volunteer = await VolunteerModel.getById(volunteer_id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    res.json({ success: true, data: volunteer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve volunteer (admin only)
export const approveVolunteer = async (req: AuthRequest, res: Response) => {
  const { volunteer_id } = req.params;
  try {
    const approved = await AdminModel.approveVolunteer(volunteer_id);
    if (!approved) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    res.json({ success: true, message: 'Volunteer approved successfully', data: approved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject volunteer (admin only)
export const rejectVolunteer = async (req: AuthRequest, res: Response) => {
  const { volunteer_id } = req.params;
  try {
    const rejected = await AdminModel.rejectVolunteer(volunteer_id);
    if (!rejected) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    res.json({ success: true, message: 'Volunteer rejected successfully', data: rejected });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update volunteer availability (admin only)
export const updateVolunteerAvailability = async (req: AuthRequest, res: Response) => {
  const { volunteer_id } = req.params;
  const { availability } = req.body;
  if (!availability) {
    return res.status(400).json({ success: false, message: 'Availability is required' });
  }
  try {
    const updated = await VolunteerModel.updateAvailability(volunteer_id, availability);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    res.json({ success: true, message: 'Availability updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};