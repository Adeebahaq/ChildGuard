import { Request, Response } from "express";
import { ReportModel, Report } from "../models/report";

export class ReportController {
  static createReport(req: Request, res: Response) {
    try {
      const data: Report = req.body;
      const report = ReportModel.create(data);
      res.status(201).json(report);
    } catch (err) {
      res.status(500).json({ message: "Failed to create report", error: err });
    }
  }

  static getReportById(req: Request, res: Response) {
    const id = req.params.id;
    const report = ReportModel.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  }

  static getAllReports(req: Request, res: Response) {
    const reports = ReportModel.findAll();
    res.json(reports);
  }

  static deleteReport(req: Request, res: Response) {
    const id = req.params.id;
    const deleted = ReportModel.deleteById(id);
    if (!deleted) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted successfully" });
  }

  static updateReportStatus(req: Request, res: Response) {
    const id = req.params.id;
    const { status } = req.body;
    const updated = ReportModel.updateStatus(id, status);
    if (!updated) return res.status(404).json({ message: "Report not found" });
    res.json(updated);
  }
}
