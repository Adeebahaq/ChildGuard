"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/volunteerRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const volunteer_1 = require("../models/volunteer");
const router = (0, express_1.Router)();
// Keep auth middleware but log the token for debugging
router.use((req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("[Auth] Received token:", token);
    next();
});
router.use(authMiddleware_1.authMiddleware);
// GET Volunteer by ID
router.get("/:volunteerId", async (req, res) => {
    const { volunteerId } = req.params;
    try {
        let volunteer = await volunteer_1.VolunteerModel.getById(volunteerId);
        // Create volunteer if not exists
        if (!volunteer) {
            volunteer = await volunteer_1.VolunteerModel.create(volunteerId);
        }
        res.json({ volunteer });
    }
    catch (err) {
        console.error("Volunteer fetch error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// UPDATE Availability (PUT)
router.put("/:volunteerId/availability", async (req, res) => {
    const { volunteerId } = req.params;
    const availability = req.body;
    console.log(`[PUT] Availability for ${volunteerId}:`, availability);
    try {
        const updated = await volunteer_1.VolunteerModel.updateAvailability(volunteerId, availability);
        if (!updated) {
            return res.status(400).json({ message: "Failed to update availability" });
        }
        res.json({ volunteer: updated });
    }
    catch (err) {
        console.error("Availability update error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// REQUEST Approval (POST)
// REQUEST Approval (POST)
router.post("/:volunteerId/request", async (req, res) => {
    const { volunteerId } = req.params;
    const { phone = "", area = "", age = 18, availability = { days: [], time: "" } } = req.body; // <-- added age
    console.log(`[POST] Request Approval for ${volunteerId}`);
    console.log("Payload from frontend:", req.body);
    try {
        // Fetch volunteer first
        let volunteer = await volunteer_1.VolunteerModel.getById(volunteerId);
        if (!volunteer) {
            console.log("Volunteer not found, creating a new one");
            volunteer = await volunteer_1.VolunteerModel.create(volunteerId);
        }
        // Allow request only if status is 'pending'
        if (volunteer.status !== "pending") {
            return res
                .status(400)
                .json({ message: `Cannot request approval, status is '${volunteer.status}'` });
        }
        // Update volunteer with frontend data including age
        const updated = await volunteer_1.VolunteerModel.requestApproval(volunteerId, {
            phone,
            area,
            age, // <-- pass age to model
            availability,
        });
        if (!updated) {
            return res.status(500).json({ message: "Failed to update volunteer" });
        }
        res.json({ volunteer: updated });
    }
    catch (err) {
        console.error("Request approval error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = router;
