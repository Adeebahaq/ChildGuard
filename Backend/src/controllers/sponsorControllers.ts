import { Request, Response } from "express";
import { SponsorModel } from "../models/sponsor";

export const SponsorController = {
  create: (req: Request, res: Response) => {
    try {
      const sponsor = SponsorModel.create(req.body);
      res.json({ message: "Sponsor created successfully", sponsor });
    } catch (err) {
      res.status(500).json({ error: "Failed to create sponsor", details: err });
    }
  },

  getAll: (_req: Request, res: Response) => {
    const sponsors = SponsorModel.findAll();
    res.json(sponsors);
  },

  getOne: (req: Request, res: Response) => {
    const sponsor = SponsorModel.findById(req.params.id);
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });
    res.json(sponsor);
  },

  update: (req: Request, res: Response) => {
    const sponsor = SponsorModel.update(req.params.id, req.body);
    if (!sponsor) return res.status(404).json({ message: "Sponsor not found" });
    res.json({ message: "Sponsor updated successfully", sponsor });
  },

  delete: (req: Request, res: Response) => {
    const deleted = SponsorModel.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Sponsor not found" });
    res.json({ message: "Sponsor deleted successfully" });
  },
};
