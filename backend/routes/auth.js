const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Helper to generate a random 6-digit numeric token
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Config NodeMailer Transporter using secure Environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. SIGNUP: Create Account & Send Registration OTP
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User account already exists!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otpCode = generateOTP();

        // Check if this specific email belongs to our fixed Admin rule set config
        const assignedRole = (email.toLowerCase() === 'mahamrafiqmuhammadrafiq@gmail.com') ? 'admin' : 'user';

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: assignedRole,
            otp: otpCode,
            otpExpires: Date.now() + 15 * 60 * 1000 // Valid for 15 minutes
        });

        await user.save();

        // Fire dynamic email tracking dispatch system
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SMIT Hackathon Account Verification Code',
            text: `Hi ${name},\n\nYour account verification code is: ${otpCode}\n\nThis token expires in 15 minutes.`
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "Registration successful! Verification code sent to email.", debug_otp: otpCode });
    } catch (err) {
        res.status(500).json({ message: "Server signup error", error: err.message });
    }
});

// 2. VERIFY-OTP: Active account and issue standard JWT access tokens
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired verification token!" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: "Account verified successfully!", token, user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: "Verification failed", error: err.message });
    }
});

// 3. LOGIN: Authenticate users & return parameters mapping
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Account Credentials!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Account Credentials!" });

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: "Login server crash", error: err.message });
    }
});

// 4. FORGOT-PASSWORD: Create dynamic 6-digit recovery code and send email ➔ ✨ ROUTE RESTORED FOR PRODUCTION
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found with this email address!" });

        const recoveryCode = generateOTP();
        user.otp = recoveryCode;
        user.otpExpires = Date.now() + 15 * 60 * 1000; // 15 mins expiry
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SMIT Hackathon Password Recovery Token',
            text: `Hello,\n\nYou requested a password reset. Your 6-digit recovery verification code is: ${recoveryCode}\n\nUse this to reset your account password.`
        };
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Recovery verification code dispatched to your email inbox successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Forgot password server pipeline error", error: err.message });
    }
});

// 5. RESET-PASSWORD: Match recovery token and save new password ➔ ✨ ROUTE RESTORED FOR PRODUCTION
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Account matching records not found!" });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired recovery verification code!" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Your account password has been changed successfully! Redirecting to login page..." });
    } catch (err) {
        res.status(500).json({ message: "Reset password pipeline processing error", error: err.message });
    }
});

module.exports = router;
