// src/config/db.ts
import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
    try {
        // 1. Grab the secret string from the .env file
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            throw new Error("MONGO_URI is missing in environment variables!");
        }

        // 2. Attempt to connect to the database
        const connection = await mongoose.connect(mongoURI);
        
        console.log(`✅ MongoDB Connected Successfully: ${connection.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
        // If the database fails, the app is useless, so we kill the server process
        process.exit(1); 
    }
};

export const disconnectDatabase = async (): Promise<void> => {
    try {
        await mongoose.disconnect();
        console.log("✅ MongoDB Disconnected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Disconnection Failed:", error);
    }
};