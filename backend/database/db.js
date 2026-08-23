import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB = async () => {
    try {
        // Fallback for local ISP/router DNS servers that fail SRV query resolution
        try {
            dns.setServers(['8.8.8.8', '1.1.1.1']);
        } catch {
            // Ignore if platform environment restricts custom DNS servers
        }

        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'FlagZilla',
            serverSelectionTimeoutMS: 5000,
        });

        console.log("Database connected successfully");
    } catch (err) {
        console.error("Error in database connection:", err);
        throw err;
    }
};