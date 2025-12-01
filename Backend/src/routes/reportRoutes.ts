import { Router, Request, Response } from "express";
import { ReportModel, Report } from "../models/report";  // ensure file name matches

const router = Router();

// -------------------------------------
// CREATE new report
// POST /reports
// -------------------------------------
router.post("/", (req: Request, res: Response) => {
  try {
    const data: Report = req.body;
    const report = ReportModel.create(data);
    res.status(201).json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// GET all reports
// GET /reports
// -------------------------------------
router.get("/", (req: Request, res: Response) => {
  try {
    const reports = ReportModel.findAll();
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// GET report by ID
// GET /reports/:id
// -------------------------------------
router.get("/:id", (req: Request, res: Response) => {
  try {
    const report = ReportModel.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// DELETE report by ID
// DELETE /reports/:id
// -------------------------------------
router.delete("/:id", (req: Request, res: Response) => {
  try {
    const deleted = ReportModel.deleteById(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Report not found" });
    res.json({ message: "Report deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------
// UPDATE report status
// PATCH /reports/:id/status
// -------------------------------------
router.patch("/:id/status", (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updatedReport = ReportModel.updateStatus(req.params.id, status);
    if (!updatedReport) return res.status(404).json({ error: "Report not found" });
    res.json(updatedReport);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
