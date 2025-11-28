import { Router } from "express";
import { UserModel } from "../models/User";

const router = Router();


router.get("/profile/:user_id", (req, res) => {
  const { user_id } = req.params;
  const user = UserModel.findById(user_id);

  if (!user) return res.status(404).json({ error: "User not found" });

  const profile = UserModel.toPublicProfile(user);
  return res.json(profile);
});

export default router;
