"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_1 = require("../models/report"); // ensure file name matches
const router = (0, express_1.Router)();
// -------------------------------------
// CREATE new report
// POST /reports
// -------------------------------------
router.post("/", (req, res) => {
    try {
        const data = req.body;
        const report = report_1.ReportModel.create(data);
        res.status(201).json(report);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// -------------------------------------
// GET all reports
// GET /reports
// -------------------------------------
router.get("/", (req, res) => {
    try {
        const reports = report_1.ReportModel.findAll();
        res.json(reports);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// -------------------------------------
// GET report by ID
// GET /reports/:id
// -------------------------------------
router.get("/:id", (req, res) => {
    try {
        const report = report_1.ReportModel.findById(req.params.id);
        if (!report)
            return res.status(404).json({ error: "Report not found" });
        res.json(report);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// -------------------------------------
// DELETE report by ID
// DELETE /reports/:id
// -------------------------------------
router.delete("/:id", (req, res) => {
    try {
        const deleted = report_1.ReportModel.deleteById(req.params.id);
        if (!deleted)
            return res.status(404).json({ error: "Report not found" });
        res.json({ message: "Report deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// -------------------------------------
// UPDATE report status
// PATCH /reports/:id/status
// -------------------------------------
router.patch("/:id/status", (req, res) => {
    try {
        const { status } = req.body;
        const updatedReport = report_1.ReportModel.updateStatus(req.params.id, status);
        if (!updatedReport)
            return res.status(404).json({ error: "Report not found" });
        res.json(updatedReport);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
