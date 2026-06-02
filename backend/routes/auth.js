const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); 
const User = require('../models/User');

// Nodemailer Config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: '://gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

// ==========================================
// 1. SIGNUP ROUTE
// ==========================================
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Security Layer: Hardcoded Admin Emails Configuration
        const adminEmails = ['admin@gmail.com', 'mahamrafiqmuhammadrafiq@gmail.com', 'mahamadmin@test.com']; 
        
        let assignedRole = 'user'; 
        if (adminEmails.includes(email.toLowerCase())) {
            assignedRole = 'admin'; 
        }

        const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: assignedRole, 
            otp: generatedOTP,
            otpExpire: Date.now() + 5 * 60 * 1000 
        });

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SMIT Hackathon Account Verification OTP Code',
            text: `Welcome ${name}!\n\nYour dynamic validation verification OTP code is: ${generatedOTP}.\n\nThis code is valid for 5 minutes.`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailErr) {
            console.log(`[HACKATHON EMAIL BYPASS] OTP for ${email} is: ${generatedOTP}`);
        }

        res.status(201).json({ 
            message: "User registered successfully! Verification OTP code sent.",
            debug_otp: generatedOTP 
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ==========================================
// 2. VERIFY SIGNUP OTP ROUTE (Auto-Login Activated)
// ==========================================
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User profile not found." });
        if (user.isVerified) return res.status(400).json({ message: "Account already active and verified." });

        if (user.otp !== otp || user.otpExpire < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP authentication code." });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        // OTP verified hote hi Token generate karna taake user direct dashboard chala jaye
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            message: "Email validation successful! Auto-logging in...",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ==========================================
// 3. LOGIN ROUTE
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        if (!user.isVerified) {
            return res.status(403).json({ message: "Account inactive! Please verify your email via OTP first." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Login successful!",
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ==========================================
// 4. FORGOT PASSWORD ROUTE
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No user found with this email address." });

        const recoveryOTP = Math.floor(1000 + Math.random() * 9000).toString();
        
        user.resetPasswordToken = crypto.createHash('sha256').update(recoveryOTP).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SMIT Hackathon Password Recovery OTP Code',
            text: `Hi ${user.name},\n\nYou requested a password reset. Your dynamic password recovery OTP verification code is: ${recoveryOTP}\n\nThis code will expire in 10 minutes.`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailErr) {
            console.log(`[HACKATHON EMAIL BYPASS] Reset OTP for ${email} is: ${recoveryOTP}`);
        }

        res.status(200).json({ 
            message: "Password Recovery OTP dispatched to your registered email successfully!",
            debug_otp: recoveryOTP 
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ==========================================
// 5. RESET PASSWORD ROUTE
// ==========================================
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            email,
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired reset OTP code." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: "Password updated successfully! You can now login." });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;
