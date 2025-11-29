import { Router } from "express";
import { SponsorController } from "../controllers/sponsorControllers";

const router = Router();

router.post("/", SponsorController.create);
router.get("/", SponsorController.getAll);
router.get("/:id", SponsorController.getOne);
router.put("/:id", SponsorController.update);
router.delete("/:id", SponsorController.delete);

export default router;
