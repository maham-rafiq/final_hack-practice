const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Initialize App
const app = express();

// Global CORS Rules Bypass
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// Lazy database connection initialization middleware layer 🎯
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        return res.status(500).json({ message: "Database connection failed", error: err.message });
    }
});

// Routes Import
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); 

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); 

// Core Base Test Route
app.get('/', (req, res) => {
    res.status(200).send("API is running perfectly with Products CRUD!");
});

// Fallback Route for non-matching assets or endpoints
app.use((req, res) => {
    res.status(404).json({ message: "Endpoint path route not found" });
});

module.exports = app; // 🚀 Export Express app instance directly for Vercel Engine
