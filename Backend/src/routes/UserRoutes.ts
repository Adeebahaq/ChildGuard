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
// PUT /user/profile/:user_id
router.put("/profile/:user_id", (req, res) => {
  const { user_id } = req.params;
  const { username, email } = req.body;

  const updatedProfile = UserModel.updateProfile(user_id, { username, email });

  if (!updatedProfile) return res.status(404).json({ error: "User not found or no changes made" });

  return res.json(updatedProfile);
});

export default router;
