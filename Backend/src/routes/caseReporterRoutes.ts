// backend/src/routes/caseReporterRoutes.ts
import { Router } from "express";
import { CaseReporterModel } from "../models/caseReporter";

const router = Router();
router.post("/report", (req, res) => {
  try {
    const report = CaseReporterModel.reportCase(req.body);
    res.status(201).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

export default router;
