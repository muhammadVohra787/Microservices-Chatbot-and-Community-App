// server/microservices/auth-service/config/config.js
import dotenv from 'dotenv';
dotenv.config();
// Configuration for auth-service
export const config = {
    db: process.env.MONGO_URI || 'mongodb://localhost:27017/authServiceDB', 
    JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
    port: process.env.AUTH_PORT || 4001,
};
// Log in development mode

if (process.env.NODE_ENV !== 'production') {
    console.log(`🔐 JWT_SECRET in auth-service config: ${config.JWT_SECRET}`);
    console.log(`🚀 Auth Microservice running on port: ${config.port}`);
}