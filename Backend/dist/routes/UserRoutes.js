"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.get("/profile/:user_id", (req, res) => {
    const { user_id } = req.params;
    const user = User_1.UserModel.findById(user_id);
    if (!user)
        return res.status(404).json({ error: "User not found" });
    const profile = User_1.UserModel.toPublicProfile(user);
    return res.json(profile);
});
// PUT /user/profile/:user_id
router.put("/profile/:user_id", (req, res) => {
    const { user_id } = req.params;
    const { username, email } = req.body;
    const updatedProfile = User_1.UserModel.updateProfile(user_id, { username, email });
    if (!updatedProfile)
        return res.status(404).json({ error: "User not found or no changes made" });
    return res.json(updatedProfile);
});
exports.default = router;
