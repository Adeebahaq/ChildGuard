// backend/src/controllers/familyController.ts
import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { FamilyModel } from "../models/family";
import multer from "multer";
import path from "path";
import fs from "fs";

// ---------------- Multer setup ----------------
const uploadDir = path.join(__dirname, "../../uploads/family_docs");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, "");
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage }).array("proof_documents", 5); // max 5 files

// ---------------- Helper ----------------
const handleFileUpload = (req: AuthRequest, res: Response) => {
  return new Promise<Express.Multer.File[]>((resolve, reject) => {
    upload(req as any, res as any, (err: any) => {
      if (err) reject(err);
      else resolve((req as any).files || []);
    });
  });
};

// ---------------- Controller ----------------
export class FamilyController {
  // -------------------------------
  // Get current parent's family
  // -------------------------------
  static async getMyFamily(req: AuthRequest, res: Response) {
    try {
      const parentId = req.user!.user_id;
      const family = FamilyModel.getByParentId(parentId);

      if (!family) {
        return res.status(404).json({
          success: false,
          message: "No family found for this parent.",
        });
      }

      return res.json({ success: true, family });
    } catch (err: any) {
      console.error("Get My Family Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch family.",
      });
    }
  }

  // -------------------------------
  // Get all families (admin/volunteer)
  // -------------------------------
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const families = FamilyModel.getAll();
      return res.json({ success: true, families });
    } catch (err: any) {
      console.error("Get All Families Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch families.",
      });
    }
  }

  // -------------------------------
  // Get family by ID
  // -------------------------------
  static async getById(req: AuthRequest, res: Response) {
    try {
      const familyId = req.params.family_id;
      const family = FamilyModel.getById(familyId);

      if (!family) {
        return res.status(404).json({
          success: false,
          message: "Family not found.",
        });
      }

      return res.json({ success: true, family });
    } catch (err: any) {
      console.error("Get Family By ID Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to fetch family.",
      });
    }
  }

  // -------------------------------
  // Verify family (admin only)
  // -------------------------------
  static async verifyFamily(req: AuthRequest, res: Response) {
    try {
      const familyId = req.params.family_id;
      const { status } = req.body; // expected 'verified' or 'rejected'
      const volunteerId = req.user!.user_id; // optional: who verified

      const family = FamilyModel.getById(familyId);
      if (!family) {
        return res.status(404).json({
          success: false,
          message: "Family not found.",
        });
      }

      // Call model method
      FamilyModel.verifyFamily(familyId, status, volunteerId);

      return res.json({
        success: true,
        message: `Family verification status updated to ${status}.`,
      });
    } catch (err: any) {
      console.error("Verify Family Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to verify family.",
      });
    }
  }

  // -------------------------------
  // Update support status (admin)
  // -------------------------------
  static async updateSupportStatus(req: AuthRequest, res: Response) {
    try {
      const familyId = req.params.family_id;
      const { support_status, sponsor_id } = req.body;

      const family = FamilyModel.getById(familyId);
      if (!family) {
        return res.status(404).json({
          success: false,
          message: "Family not found.",
        });
      }

      FamilyModel.updateSupportStatus(familyId, support_status, sponsor_id);

      return res.json({
        success: true,
        message: `Family support status updated to ${support_status}.`,
      });
    } catch (err: any) {
      console.error("Update Support Status Error:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to update support status.",
      });
    }
  }

  // -------------------------------
  // Upload proof documents (parent)
  // -------------------------------
  static async uploadProofDocuments(req: AuthRequest, res: Response) {
    try {
      const parentId = req.user!.user_id;

      const files = await handleFileUpload(req, res);
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded.",
        });
      }

      // Get family
      const family = FamilyModel.getByParentId(parentId);
      if (!family) {
        return res.status(404).json({
          success: false,
          message: "Family not found. Please register your family first.",
        });
      }

      // Store relative paths
      const uploadedPaths = files.map((file) =>
        path.relative(path.join(__dirname, "../../uploads"), file.path).replace(/\\/g, "/")
      );

      // Append new uploads to existing files if needed
      const allFiles = [...(family.proof_documents || []), ...uploadedPaths];
      FamilyModel.uploadProofDocuments(family.family_id, allFiles);

      return res.json({
        success: true,
        message: "Proof documents uploaded successfully.",
        files: uploadedPaths,
      });
    } catch (error: any) {
      console.error("Upload Proof Documents Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to upload proof documents.",
      });
    }
  }
}
