import { Response } from 'express';
import { AwarenessContentModel } from '../models/AwarenessContent';
import { AuthRequest } from '../middleware/authMiddleware';
import { AdminModel } from '../models/admin';
import { VolunteerModel } from '../models/volunteer';
import { VisitModel } from '../models/Visit';
import { BaseModel } from '../models/BaseModels';   // ← KEEP THIS IMPORT

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

// Get all volunteers (admin only)
export const getAllVolunteers = async (_req: any, res: Response) => {
  try {
    const volunteers = await AdminModel.getAllVolunteers();

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

// Get requested volunteers (admin only)
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

// see availability 
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

// ==================== CASE REPORTS CONTROLLERS ====================

// FINAL FIXED: Get all reported cases — WORKS WITH [ACCEPTED]/[CANCELLED] IN FINDINGS
export const getAllReports = async (_req: any, res: Response) => {
  try {
    BaseModel.init();

    const reports = BaseModel.db.prepare(`
      SELECT 
        r.*,
        CASE 
          WHEN v.findings LIKE '[ACCEPTED]%' THEN 'accepted'
          WHEN v.findings LIKE '[CANCELLED]%' THEN 'cancelled'
          ELSE NULL 
        END AS verification_status
      FROM reports r
      LEFT JOIN verification_visits v 
        ON r.report_id = v.target_id 
        AND v.target_type = 'report'
        AND v.status = 'completed'
      ORDER BY r.reported_at DESC
    `).all();

    res.json({ success: true, data: reports });
  } catch (error: any) {
    console.error("Error fetching reports for admin:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// Assign volunteer to a report ← Your original code (unchanged)
export const assignVolunteerToReport = async (req: AuthRequest, res: Response) => {
  const { reportId } = req.params;
  const { volunteerId } = req.body;

  if (!volunteerId) {
    return res.status(400).json({ success: false, message: 'volunteerId is required' });
  }

  try {
    // Step 1: Update the report
    const success = await AdminModel.assignVolunteerToReport(reportId, volunteerId);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Report not found or already assigned' });
    }

    // Step 2: CREATE THE VERIFICATION VISIT 
    await VisitModel.createVisit({
      volunteer_id: volunteerId,
      target_id: reportId,
      target_type: "report"
      // visit_date is optional → can be set later
    });

    const updatedReport = await AdminModel.getReportById(reportId);
    res.json({ success: true, message: 'Volunteer assigned successfully', data: updatedReport });
  } catch (error: any) {
    console.error("Error assigning volunteer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== FAMILY MANAGEMENT (SAME AS VOLUNTEERS) ====================

// Get pending family requests
export const getRequestedFamilies = async (_req: any, res: Response) => {
  try {
    const families = await AdminModel.getRequestedFamilies();
    res.json({ success: true, data: families });
  } catch (error: any) {
    console.error('Error in getRequestedFamilies:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// FIXED: Get approved families — NOW INCLUDES assigned_volunteer_id
export const getApprovedFamilies = async (_req: any, res: Response) => {
  try {
    BaseModel.init();

    const families = BaseModel.db.prepare(`
      SELECT 
        f.*,
        u.username AS parent_name,
        u.email AS parent_email,
        f.assigned_volunteer_id
      FROM families f
      JOIN users u ON f.parent_id = u.user_id
      WHERE f.verification_status = 'verified'
      ORDER BY f.created_at DESC
    `).all();

    res.json({ success: true, data: families });
  } catch (error: any) {
    console.error('Error in getApprovedFamilies:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Get rejected families
export const getRejectedFamilies = async (_req: any, res: Response) => {
  try {
    const families = await AdminModel.getRejectedFamilies();
    res.json({ success: true, data: families });
  } catch (error: any) {
    console.error('Error in getRejectedFamilies:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// Approve family request
export const approveFamily = async (req: AuthRequest, res: Response) => {
  const { family_id } = req.params;
  try {
    const approved = await AdminModel.approveFamily(family_id);
    if (!approved) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }
    res.json({ success: true, message: 'Family approved successfully', data: approved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject family request
export const rejectFamily = async (req: AuthRequest, res: Response) => {
  const { family_id } = req.params;
  try {
    const rejected = await AdminModel.rejectFamily(family_id);
    if (!rejected) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }
    res.json({ success: true, message: 'Family rejected successfully', data: rejected });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};