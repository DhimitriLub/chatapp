import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary, { isEnabled as isCloudinaryEnabled } from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import mongoose from "mongoose";

const router = express.Router();

// Get users for sidebar
router.get("/users", protectRoute, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const users = await User.find({ _id: { $ne: loggedInUserId } })
            .select("-password")
            .sort({ username: 1 });
        return res.status(200).send({ ok: true, data: users });
    } catch (error) {
        console.error("Error in get users:", error);
        return res.status(500).send({ ok: false, code: "ERRORS.SERVER_ERROR", error: error.message });
    }
});

// Get all messages with a user
router.get("/:id", protectRoute, async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).send({ 
                ok: false, 
                code: "ERRORS.INVALID_ID" 
            });
        }

        const messages = await Message.find({
            $or: [
                { senderId: new mongoose.Types.ObjectId(senderId), receiverId: new mongoose.Types.ObjectId(receiverId) },
                { senderId: new mongoose.Types.ObjectId(receiverId), receiverId: new mongoose.Types.ObjectId(senderId) }
            ]
        }).sort({ createdAt: 1 });

        // Mark messages as seen
        if (messages.length > 0) {
            await Message.updateMany(
                { 
                    senderId: receiverId, 
                    receiverId: senderId,
                    seen: false 
                },
                { seen: true }
            );

            // Emit socket event for seen status
            const senderSocketId = getReceiverSocketId(receiverId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesSeen", { 
                    senderId: receiverId, 
                    receiverId: senderId 
                });
            }
        }

        return res.status(200).send({ ok: true, data: messages });
    } catch (error) {
        console.error("Error in get messages:", error);
        return res.status(500).send({ ok: false, code: "ERRORS.SERVER_ERROR", error: error.message });
    }
});

// Send a message
router.post("/", protectRoute, async (req, res) => {
    try {
        const { text, image, receiverId } = req.body;
        const senderId = req.user._id;

        if (!receiverId) {
            return res.status(400).send({ ok: false, code: "ERRORS.RECEIVER_REQUIRED" });
        }

        if (!text && !image) {
            return res.status(400).send({ ok: false, code: "ERRORS.MESSAGE_CONTENT_REQUIRED" });
        }

        // Validate receiverId
        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).send({ ok: false, code: "ERRORS.INVALID_RECEIVER_ID" });
        }

        let imageUrl;
        if (image) {
            if (!isCloudinaryEnabled) {
                return res.status(400).send({ 
                    ok: false, 
                    code: "ERRORS.IMAGE_UPLOAD_DISABLED",
                    message: "Image upload is currently disabled. Please try sending only text messages."
                });
            }

            try {
                const uploadResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadResponse.secure_url;
            } catch (error) {
                console.error("Error uploading image:", error);
                return res.status(500).send({ 
                    ok: false, 
                    code: "ERRORS.IMAGE_UPLOAD_FAILED",
                    message: "Failed to upload image. Please try again or send without an image."
                });
            }
        }

        const newMessage = await Message.create({
            text,
            image: imageUrl,
            senderId,
            receiverId: new mongoose.Types.ObjectId(receiverId),
            seen: false
        });

        // Emit socket event for real-time messaging
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).send({ ok: true, data: newMessage });
    } catch (error) {
        console.error("Error in send message:", error);
        return res.status(500).send({ ok: false, code: "ERRORS.SERVER_ERROR", error: error.message });
    }
});

// Update a message (mark as seen or edit)
router.put("/:id", protectRoute, async (req, res) => {
    try {
        const { id } = req.params;
        const { action, text } = req.body;
        const userId = req.user._id;

        if (!action) {
            return res.status(400).send({ ok: false, code: "ERRORS.ACTION_REQUIRED" });
        }

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ ok: false, code: "ERRORS.INVALID_ID" });
        }

        switch (action) {
            case 'markSeen':
                const messages = await Message.updateMany(
                    { 
                        senderId: new mongoose.Types.ObjectId(id), 
                        receiverId: new mongoose.Types.ObjectId(userId),
                        seen: false
                    },
                    { seen: true }
                );

                // Emit socket events for seen status
                const senderSocketId = getReceiverSocketId(id);
                const receiverSocketId = getReceiverSocketId(userId);

                if (senderSocketId) {
                    io.to(senderSocketId).emit("messagesSeen", { 
                        senderId: id, 
                        receiverId: userId 
                    });
                }

                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("messagesRead", { 
                        senderId: id 
                    });
                }

                return res.status(200).send({ ok: true, data: messages });

            case 'edit':
                if (!text) {
                    return res.status(400).send({ ok: false, code: "ERRORS.TEXT_REQUIRED" });
                }

                const message = await Message.findById(id);
                
                if (!message) {
                    return res.status(404).send({ ok: false, code: "ERRORS.MESSAGE_NOT_FOUND" });
                }

                if (message.senderId.toString() !== userId.toString()) {
                    return res.status(403).send({ ok: false, code: "ERRORS.NOT_AUTHORIZED" });
                }

                message.text = text;
                await message.save();

                // Emit socket event for edited message
                const otherUserSocketId = getReceiverSocketId(message.receiverId);
                if (otherUserSocketId) {
                    io.to(otherUserSocketId).emit("messageEdited", message);
                }
                
                return res.status(200).send({ ok: true, data: message });

            default:
                return res.status(400).send({ ok: false, code: "ERRORS.INVALID_ACTION" });
        }
    } catch (error) {
        console.error("Error in update message:", error);
        return res.status(500).send({ ok: false, code: "ERRORS.SERVER_ERROR", error: error.message });
    }
});

// Get unread message counts
router.get("/unread/counts", protectRoute, async (req, res) => {
    try {
        const userId = req.user._id;

        const unreadCounts = await Message.aggregate([
            {
                $match: {
                    receiverId: new mongoose.Types.ObjectId(userId),
                    seen: false
                }
            },
            {
                $group: {
                    _id: "$senderId",
                    count: { $sum: 1 }
                }
            }
        ]);

        const countsMap = unreadCounts.reduce((acc, { _id, count }) => {
            acc[_id.toString()] = count;
            return acc;
        }, {});

        return res.status(200).send({ ok: true, data: countsMap });
    } catch (error) {
        console.error("Error in get unread counts:", error);
        return res.status(500).send({ ok: false, code: "ERRORS.SERVER_ERROR", error: error.message });
    }
});

// Get all users with messages
router.get("/users", protectRoute, async (req, res) => {
    try {
        const userId = req.user._id;

        const users = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", userId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    lastMessage: { $last: "$$ROOT" }
                }
            },
            {
                $sort: { "lastMessage.createdAt": -1 }
            }
        ]);

        return res.status(200).send({ ok: true, data: users });
    } catch (error) {
        console.error("Error in get users with messages:", error);
        return res.status(500).send({ ok: false, code: "ERRORS.SERVER_ERROR", error: error.message });
    }
});

export default router;