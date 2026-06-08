const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. SIGNUP ROUTE
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User account already exists!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const otpCode = generateOTP();
        const assignedRole = (email.toLowerCase() === 'mahamrafiqmuhammadrafiq@gmail.com') ? 'admin' : 'user';

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: assignedRole,
            otp: otpCode,
            otpExpires: Date.now() + 15 * 60 * 1000
        });

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SMIT Hackathon Account Verification Code',
            text: `Hi ${name},\n\nYour verification code is: ${otpCode}`
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "Verification code sent to email.", debug_otp: otpCode });
    } catch (err) {
        res.status(500).json({ message: "Server signup error", error: err.message });
    }
});

// 2. VERIFY-OTP ROUTE
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
        res.status(200).json({ message: "Verified!", token, user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: "Verification failed", error: err.message });
    }
});

// 3. LOGIN ROUTE
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials!" });

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user: { name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: "Login error", error: err.message });
    }
});

// 4. FORGOT-PASSWORD ROUTE (Direct routing mapping handler lock) 🎯
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found with this email address!" });

        const recoveryCode = generateOTP();
        user.otp = recoveryCode;
        user.otpExpires = Date.now() + 15 * 60 * 1000; 
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SMIT Hackathon Password Recovery Token',
            text: `Your 6-digit recovery verification code is: ${recoveryCode}`
        };
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Recovery verification code dispatched to your email inbox successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// 5. RESET-PASSWORD ROUTE
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Account records not found!" });

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired recovery code!" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password has been changed successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Reset error", error: err.message });
    }
});

module.exports = router;
