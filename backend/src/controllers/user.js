import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { uploadImage } from '../utils/cloudinary.js';

export const getUsers = async (req, res) => {
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
};

export const getUsersWithMessages = async (req, res) => {
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
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        // Handle profile picture upload
        if (req.file) {
            // Convert buffer to base64
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            
            // Upload to cloudinary
            const imageUrl = await uploadImage(base64Image);

            // Update user with new profile picture
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { profilePic: imageUrl },
                { new: true }
            ).select('-password');

            return res.status(200).json({
                ok: true,
                data: updatedUser
            });
        }

        // Handle other profile updates
        const updates = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true }
        ).select('-password');

        res.status(200).json({
            ok: true,
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            ok: false,
            error: error.message || 'Error updating profile'
        });
    }
}; 