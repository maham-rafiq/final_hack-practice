const dns = require('dns');
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Public DNS Bypass

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// 1. Routes Import
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); 

// 2. Initialize App
const app = express();

// 3. Middlewares
// 🌍 Live Deploy Environment CORS Dynamic Security Setup (Bypassed for Hackathon)
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// 4. Connect to Cloud Database
connectDB();

// 5. Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); 

// Test Route
app.get('/', (req, res) => {
    res.send("API is running perfectly with Products CRUD!");
});

// Start Server (Vercel Integration Export Fix)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}

module.exports = app; // Zaroori for Vercel Serverless Function Execution 🚀
