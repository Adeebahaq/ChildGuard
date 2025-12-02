"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Configure Gmail transporter
exports.transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "nasadeeba11@gmail.com",
        pass: "ihynmqdaimuhvuvl", // App password WITHOUT spaces
    },
});
// Email Validator
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
const sendResetEmail = async (to, token) => {
    console.log("📩 Requested password reset for:", `"${to}"`);
    // Trim & validate email
    if (!to || typeof to !== "string") {
        throw new Error("Receiver email is missing.");
    }
    to = to.trim();
    if (!isValidEmail(to)) {
        throw new Error(`Invalid email format: ${to}`);
    }
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    const mailOptions = {
        from: '"ChildGuard Support" <nasadeeba11@gmail.com>',
        to,
        subject: "Password Reset Request",
        html: `
      <p>You requested a password reset.</p>
      <p>Use this token to reset your password:</p>
      <h3>${token}</h3>
      <p>Or click this link: <a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request this, ignore this email.</p>
    `,
    };
    try {
        const info = await exports.transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", info.messageId);
        return info;
    }
    catch (error) {
        console.error("❌ Error sending email:", error);
        throw new Error("Failed to send reset email.");
    }
};
exports.sendResetEmail = sendResetEmail;
