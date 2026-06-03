const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return; // Use existing database connection channel
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
