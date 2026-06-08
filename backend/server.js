const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const nodemailer = require('nodemailer');

const app = express();

// 🌍 Production Standard Absolute CORS Policy Wrapper
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());
app.options('*', cors());

// Routes Imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); 

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); 

// 🎯 ULTIMATE BACKEND FORGOT-PASSWORD HARD ROUTE (Bypasses Vercel Environment Variables Missing Glitch)
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No account found with this email address!" });

        const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = recoveryCode;
        user.otpExpires = Date.now() + 15 * 60 * 1000; 
        await user.save();

        // 🚨 FALLBACK CONFIGURATION OVERRIDE: If Vercel variables freeze, use these parameters directly
        const my_email = process.env.EMAIL_USER || 'mahamrafiqmuhammadrafiq@gmail.com';
        const my_pass = process.env.EMAIL_PASS || 'dhyb xorw xdfi kptc'; // (Apna real 16-digit app password space bina copy paste karein)

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: my_email, pass: my_pass }
        });

        const mailOptions = {
            from: my_email,
            to: email,
            subject: 'SMIT Hackathon Password Recovery Token',
            text: `Hi,\n\nYour 6-digit recovery verification code is: ${recoveryCode}\n\nUse this token to reset your password safely.`
        };
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Recovery verification code dispatched to your email inbox successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Server parsing error during mail trigger", error: err.message });
    }
});

app.get('/', (req, res) => {
    res.status(200).send("API is running perfectly with Products CRUD!");
});

connectDB().catch((err) => console.error(err.message));

module.exports = app;
