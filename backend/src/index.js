import dotenv from "dotenv";

// Load environment variables before any other imports
dotenv.config();

import express from "express"; 
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import {connectDB} from "./lib/db.js"
import { app, server, io } from "./lib/socket.js";
import { protectRoute } from "./middleware/protectRoute.js";
import { signup, login, logout, checkAuth } from "./controllers/auth.js";
import { getUsers, getUsersWithMessages, updateProfile } from "./controllers/user.js";
import { getMessages, sendMessage, updateMessage, getUnreadCounts } from "./controllers/message.js";
import { handleUpload } from './middleware/uploadMiddleware.js';

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

// Auth routes
app.post("/api/auth/signup", signup);
app.post("/api/auth/login", login);
app.post("/api/auth/logout", logout);
app.get("/api/auth/check", protectRoute, checkAuth);
app.put("/api/auth/update-profile", protectRoute, handleUpload, updateProfile);

// User routes
app.get("/api/messages/users", protectRoute, getUsers);
app.get("/api/messages/users/with-messages", protectRoute, getUsersWithMessages);

// Message routes
app.get("/api/messages/:id", protectRoute, getMessages);
app.post("/api/messages", protectRoute, sendMessage);
app.put("/api/messages/:id", protectRoute, updateMessage);
app.get("/api/messages/unread/counts", protectRoute, getUnreadCounts);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
    });
}