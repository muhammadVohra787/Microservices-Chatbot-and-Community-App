//server/microservices/auth-service/config/mongoose.js
import mongoose from 'mongoose';
import { config } from './config.js'; // Use default import
import createUser from '../scripts/discussionScript.js';
//
const connectDB = async () => {
    try {
        if (!config.db) {
            throw new Error("MongoDB URI is undefined. Check your environment variables.");
        }
        await mongoose.connect(config.db);
        console.log(`✅ Auth Service connected to MongoDB at ${config.db}`);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB (Auth Service):', error.message);
        process.exit(1);
    } finally{
        createUser();
    }
};
//
export default connectDB;