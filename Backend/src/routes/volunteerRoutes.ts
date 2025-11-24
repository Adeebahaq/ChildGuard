// src/routes/volunteerRouter.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { VolunteerModel } from "../models/volunteer";

const router = Router();
router.use(authMiddleware);


router.get("/:volunteerId", async (req, res) => {
  const { volunteerId } = req.params;

  try {
    let volunteer = await VolunteerModel.getById(volunteerId);

   
    if (!volunteer) {
      volunteer = await VolunteerModel.create(volunteerId);
    }

    res.json({ volunteer });
  } catch (err) {
    console.error("Volunteer fetch error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
});


router.put("/:volunteerId/availability", async (req, res) => {
  const { volunteerId } = req.params;
  const availability = req.body;

  try {
    const updated = await VolunteerModel.updateAvailability(volunteerId, availability);
    if (!updated) {
      return res.status(400).json({ message: "Failed to update availability" });
    }

    res.json({ volunteer: updated });
  } catch (err) {
    console.error("Availability update error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
});


router.post("/:volunteerId/request", async (req, res) => {
  const { volunteerId } = req.params;
  const { phone = "", area = "", availability = { days: [], time: "" } } = req.body;

  try {
    const updated = await VolunteerModel.requestApproval(volunteerId, {
      phone,
      area,
      availability,
    });

    if (!updated) {
      return res.status(400).json({ message: "Failed to request approval" });
    }

    res.json({ volunteer: updated });
  } catch (err) {
    console.error("Request approval error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
});

export default router;
