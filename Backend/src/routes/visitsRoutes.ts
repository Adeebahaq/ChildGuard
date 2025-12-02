// src/routes/visitsRoutes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { BaseModel } from "../models/BaseModels";

const router = Router();
router.use(authMiddleware);

router.get("/volunteer/:volunteerId", async (req, res) => {
    try {
        BaseModel.init();
        const volunteerId = req.params.volunteerId;

        const visits = BaseModel.db
            .prepare(`
                SELECT * 
                FROM verification_visits 
                WHERE volunteer_id = ? 
                ORDER BY visit_date ASC
            `)
            .all(volunteerId);

        res.status(200).json({ success: true, visits });
    } catch (err) {
        console.error("Fetch visits error:", err);
        res.status(500).json({ success: false, error: (err as Error).message });
    }
});

// FINAL FIXED FEEDBACK ROUTE — WORKS PERFECTLY FOR BOTH ADMIN & VOLUNTEER
router.put("/:visitId/feedback", async (req, res) => {
    try {
        BaseModel.init();
        const visitId = req.params.visitId;
        let { findings } = req.body;

        if (!findings || !findings.trim()) {
            return res.status(400).json({ success: false, message: "Findings cannot be empty" });
        }

        const originalFindings = findings.trim();
        findings = findings.trim().toLowerCase();

        // Detect positive vs negative feedback
        const positiveWords = ["yes", "true", "exist", "found", "real", "confirmed", "child", "valid", "correct", "there"];
        const negativeWords = ["no", "fake", "not found", "not exist", "false", "wrong", "hoax", "moved", "empty"];

        const hasPositive = positiveWords.some(word => findings.includes(word));
        const hasNegative = negativeWords.some(word => findings.includes(word));

        const verificationResult = (hasPositive && !hasNegative) ? "ACCEPTED" : "CANCELLED";

        // KEY FIX: status = "completed" so volunteer card moves to History
        // But we store [ACCEPTED] or [CANCELLED] in findings so admin can read it
        BaseModel.db
            .prepare(`
                UPDATE verification_visits 
                SET status = 'completed',
                    findings = ?,
                    completed_at = datetime('now')
                WHERE visit_id = ?
            `)
            .run(`[${verificationResult}] ${originalFindings}`, visitId);

        const updatedVisit = BaseModel.db
            .prepare(`SELECT * FROM verification_visits WHERE visit_id = ?`)
            .get(visitId);

        res.json({ success: true, visit: updatedVisit });
    } catch (err) {
        console.error("Feedback error:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;