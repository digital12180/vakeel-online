console.log('🚀 server.ts STARTING...');
import { errorHandler } from './middlewares/error.middleware.js';
import { initializeSocket } from './services/socket.service.js';
import http from "http"
// ==================== LOAD ENV FIRST ====================
import dotenv from 'dotenv';
dotenv.config({ override: true });
import { connectDB } from "./config/database.js";

// ==================== IMPORT WITH ALIASES ====================
import app from './app.js'; // ✅ Import from root
app.use(errorHandler);

const server=http.createServer(app);
initializeSocket(server);
// ==================== CONFIGURATION ====================
const PORT = process.env.PORT || 9093;
const NODE_ENV = process.env.NODE_ENV || 'development';
const HOST = process.env.HOST || 'localhost';


// ==================== DATABASE CONNECTION ====================
const connectDatabase = async (): Promise<void> => {
    try {
        await connectDB();
        console.log({ message: '✅ MongoDB connected successfully!' });
    } catch (error: any) {
        console.error({ Error: '❌ Database connection failed!' });
        throw error;
    }
};


// ==================== START SERVER ====================
const startServer = async (): Promise<void> => {
    try {

        await connectDatabase();
        // Start Express server
        server.listen(PORT, () => {
            console.log("server started at port :", PORT);
        })
    } catch (error: any) {
        console.log("Error : ", error);

        process.exit(1);
    }
};


// ==================== INITIALIZE SERVER ====================
startServer();

console.log('✅ server.ts loaded successfully');