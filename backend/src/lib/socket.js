import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5175"],
        credentials: true
    },
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
        // Emit to all clients immediately when a new user connects
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    // Handle messages
    socket.on("newMessage", (message) => {
        console.log("New message received:", message);
        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message);
        }
    });

    socket.on("messagesSeen", ({ senderId, receiverId }) => {
        console.log("Messages seen by:", receiverId, "from:", senderId);
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messagesSeen", { senderId, receiverId });
        }
    });

    socket.on("messageEdited", (message) => {
        console.log("Message edited:", message);
        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageEdited", message);
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        if (userId) {
            delete userSocketMap[userId];
            // Emit to all clients when a user disconnects
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });

    // Send initial online users to the newly connected client
    socket.emit("getOnlineUsers", Object.keys(userSocketMap));
});

export { io, server, app };
