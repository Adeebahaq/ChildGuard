"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SponsorController = void 0;
const sponsor_1 = require("../models/sponsor");
exports.SponsorController = {
    create: (req, res) => {
        try {
            const sponsor = sponsor_1.SponsorModel.create(req.body);
            res.json({ message: "Sponsor created successfully", sponsor });
        }
        catch (err) {
            res.status(500).json({ error: "Failed to create sponsor", details: err });
        }
    },
    getAll: (_req, res) => {
        const sponsors = sponsor_1.SponsorModel.findAll();
        res.json(sponsors);
    },
    getOne: (req, res) => {
        const sponsor = sponsor_1.SponsorModel.findById(req.params.id);
        if (!sponsor)
            return res.status(404).json({ message: "Sponsor not found" });
        res.json(sponsor);
    },
    update: (req, res) => {
        const sponsor = sponsor_1.SponsorModel.update(req.params.id, req.body);
        if (!sponsor)
            return res.status(404).json({ message: "Sponsor not found" });
        res.json({ message: "Sponsor updated successfully", sponsor });
    },
    delete: (req, res) => {
        const deleted = sponsor_1.SponsorModel.delete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: "Sponsor not found" });
        res.json({ message: "Sponsor deleted successfully" });
    },
};
