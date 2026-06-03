const mongoose = require('mongoose');

let isConnected = null;

const connectDB = async () => {
    // If the database connection pool is already active, reuse the reference channel immediately
    if (isConnected && mongoose.connection.readyState === 1) {
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Fast fail timeout to prevent serverless function freeze
        });
        isConnected = conn.connections.readyState;
        console.log(`✅ MongoDB Connected Successfully to Cloud Atlas!`);
    } catch (error) {
        console.error(`MongoDB Connection Error Exception: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
