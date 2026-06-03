const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// 1. Routes Import
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); 

// 2. Initialize App
const app = express();

// 3. Middlewares Setup
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// 4. Mount Routes directly (No extra middleware wrappers)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); 

// Test Route
app.get('/', (req, res) => {
    res.send("API is running perfectly with Products CRUD!");
});

// 5. Connect Database & Start Server ONLY for local development
if (process.env.NODE_ENV !== 'production') {
    connectDB().then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`🚀 Local Server running on port ${PORT}`));
    }).catch(err => console.log("Database connection failed", err));
} else {
    // Live Production: Just trigger DB call silently on export
    connectDB().catch(err => console.log("Production database connection failed", err));
}

module.exports = app; // 🚀 Crucial for Vercel Serverless Function Engine
