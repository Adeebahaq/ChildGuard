import { Router, Request, Response } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { CaseReporterModel } from "../models/caseReporter";

const router = Router();

// ================= MULTER STORAGE =====================
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ================= ROUTE =====================
router.post(
  "/report",
  upload.single("photo"),
  (req: Request, res: Response) => {
    try {
      const body = req.body;

      const report = CaseReporterModel.reportCase({
        ...body,
        child_age: body.child_age ? parseInt(body.child_age, 10) : null,
        is_anonymous: body.is_anonymous ? 1 : 0,
        photo_url: req.file ? `/uploads/${req.file.filename}` : null,
      });

      res.status(201).json({ success: true, report });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: (err as Error).message,
      });
    }
  }
);

export default router;
