"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const report_1 = require("../models/report");
class ReportController {
    static createReport(req, res) {
        try {
            const data = req.body;
            const report = report_1.ReportModel.create(data);
            res.status(201).json(report);
        }
        catch (err) {
            res.status(500).json({ message: "Failed to create report", error: err });
        }
    }
    static getReportById(req, res) {
        const id = req.params.id;
        const report = report_1.ReportModel.findById(id);
        if (!report)
            return res.status(404).json({ message: "Report not found" });
        res.json(report);
    }
    static getAllReports(req, res) {
        const reports = report_1.ReportModel.findAll();
        res.json(reports);
    }
    static deleteReport(req, res) {
        const id = req.params.id;
        const deleted = report_1.ReportModel.deleteById(id);
        if (!deleted)
            return res.status(404).json({ message: "Report not found" });
        res.json({ message: "Report deleted successfully" });
    }
    static updateReportStatus(req, res) {
        const id = req.params.id;
        const { status } = req.body;
        const updated = report_1.ReportModel.updateStatus(id, status);
        if (!updated)
            return res.status(404).json({ message: "Report not found" });
        res.json(updated);
    }
}
exports.ReportController = ReportController;
