const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// Routes Imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); 

// Standard Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); 

// 🎯 FORCE INJECTED FORGOT-PASSWORD ROUTE (Bypasses all 404 Serverless Path Errors)
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found with this email address!" });

        const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = recoveryCode;
        user.otpExpires = Date.now() + 15 * 60 * 1000; 
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SMIT Hackathon Password Recovery Token',
            text: `Your 6-digit recovery verification code is: ${recoveryCode}`
        };
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Recovery verification code dispatched to your email inbox successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Forgot password structural server error", error: err.message });
    }
});

// Test Route
app.get('/', (req, res) => {
    res.status(200).send("API is running perfectly with Products CRUD!");
});

connectDB().catch((err) => console.error(err.message));

module.exports = app;
