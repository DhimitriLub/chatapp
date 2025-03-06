import dotenv from "dotenv";

// Load environment variables before any other imports
dotenv.config();

import express from "express"; 
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import {connectDB} from "./lib/db.js"
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server, io } from "./lib/socket.js";

// Start the server
const PORT = process.env.PORT || 5001;

connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Environment:', process.env.NODE_ENV);
        });
    })
    .catch((err) => {
        console.log("Error connecting to database:", err);
    });

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5175"],
    credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
    });
}