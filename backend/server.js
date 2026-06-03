const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Initialize Express App Instance
const app = express();

// 🌍 Global Production CORS Policy Setup
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// Routes Imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); 

// Direct Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); 

// Test Route to check live server status
app.get('/', (req, res) => {
    res.status(200).send("API is running perfectly with Products CRUD!");
});

// Database connection logic wrap handling for Serverless Runtime
connectDB().then(() => {
    console.log("Database synced successfully in execution pool.");
}).catch((err) => {
    console.error("Database structural error during background boot:", err.message);
});

// Start listening ONLY if running locally
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Local Server running on port ${PORT}`);
    });
}

module.exports = app; // 🚀 Crucial export context mapping for Vercel
