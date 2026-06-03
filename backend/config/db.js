const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
    // If a connection exists and is ready, reuse it immediately
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    // If an initialization promise is pending, wait for it
    if (cachedConnection) {
        return cachedConnection;
    }

    try {
        cachedConnection = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Fast fail if connection takes too long
        });
        
        await cachedConnection;
        console.log(`✅ MongoDB Connected Successfully to Cloud Atlas Cluster!`);
        return mongoose.connection;
    } catch (error) {
        cachedConnection = null; // Clear failure cache tracking
        console.error(`MongoDB Connection Error Exception: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
