const dns = require('dns');
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Public DNS Bypass

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// 1. Routes Import
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); 

// 2. Initialize App (Yeh line hamesha routes se pehle honi chahiye!)
const app = express();

// 3. Middlewares
// 🌍 Live Deploy Environment CORS Security Config
app.use(cors({
    origin: ["http://localhost:5173", "https://vercel.app"], // (Vercel link aane par badlein ge)
    credentials: true
}));

app.use(express.json());

// 4. Connect to Cloud Database
connectDB();

// 5. Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Sahi position ✅

// Test Route
app.get('/', (req, res) => {
    res.send("API is running perfectly with Products CRUD!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
