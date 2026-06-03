const mongoose = require('mongoose');

let isConnected = null;

const connectDB = async () => {
    // If already connected, use the existing state reference channel
    if (isConnected && mongoose.connection.readyState === 1) {
        return; 
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Fast timeout fallback to prevent serverless freeze
        });
        isConnected = conn.connections[0].readyState;
        console.log(`✅ MongoDB Connected Successfully!`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
