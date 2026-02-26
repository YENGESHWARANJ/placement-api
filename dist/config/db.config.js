"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB() {
    const maxRetries = 3;
    let retryCount = 0;
    while (retryCount < maxRetries) {
        try {
            const uri = process.env.MONGO_URI;
            if (!uri) {
                throw new Error("❌ MONGO_URI not defined in environment variables");
            }
            console.log(`\n🔄 Attempting to connect to MongoDB... (Attempt ${retryCount + 1}/${maxRetries})`);
            console.log(`📡 Connection string: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
            await mongoose_1.default.connect(uri, {
                serverSelectionTimeoutMS: 30000, // 30s timeout
                socketTimeoutMS: 45000,
                family: 4, // Use IPv4, skip trying IPv6
            });
            console.log("✅ MongoDB connected successfully!");
            console.log(`📊 Database: ${mongoose_1.default.connection.name}`);
            console.log(`🌐 Host: ${mongoose_1.default.connection.host}`);
            // Setup connection event listeners
            mongoose_1.default.connection.on('disconnected', () => {
                console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
            });
            mongoose_1.default.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err);
            });
            mongoose_1.default.connection.on('reconnected', () => {
                console.log('✅ MongoDB reconnected successfully!');
            });
            return; // Success, exit function
        }
        catch (err) {
            retryCount++;
            console.error(`\n❌ MongoDB connection failed (Attempt ${retryCount}/${maxRetries})`);
            console.error(`Error: ${err.message}`);
            if (err.code) {
                console.error(`Error Code: ${err.code}`);
            }
            if (retryCount < maxRetries) {
                const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
                console.log(`⏳ Retrying in ${waitTime / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            else {
                console.error("\n⚠️ WARNING: Could not connect to MongoDB after multiple attempts");
                console.error("⚠️ Server will start but database operations will fail");
                console.error("\n💡 Troubleshooting tips:");
                console.error("   1. Check your internet connection");
                console.error("   2. Verify MongoDB Atlas is accessible");
                console.error("   3. Check if your IP is whitelisted in MongoDB Atlas");
                console.error("   4. Verify credentials in .env file");
                console.error("   5. Try using a local MongoDB instance instead\n");
                // Don't exit - allow server to start for frontend testing
                return;
            }
        }
    }
}
