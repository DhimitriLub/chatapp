import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";
import { uploadImage } from '../utils/cloudinary.js';

export const signup = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validate required fields
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).send({ 
                ok: false, 
                code: "ERRORS.REQUIRED_FIELDS" 
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).send({ 
                ok: false, 
                code: "ERRORS.PASSWORD_TOO_SHORT" 
            });
        }

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).send({ 
                ok: false, 
                code: "ERRORS.PASSWORDS_DO_NOT_MATCH" 
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ 
                ok: false, 
                code: "ERRORS.EMAIL_ALREADY_EXISTS" 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Generate token
        generateToken(newUser._id, res);

        return res.status(201).send({
            ok: true,
            data: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePic: newUser.profilePic
            }
        });
    } catch (error) {
        console.error("Error in signup:", error);
        return res.status(500).send({ 
            ok: false, 
            code: "ERRORS.SERVER_ERROR",
            error: error.message 
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).send({ 
                ok: false, 
                code: "ERRORS.REQUIRED_FIELDS" 
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ 
                ok: false, 
                code: "ERRORS.INVALID_CREDENTIALS" 
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ 
                ok: false, 
                code: "ERRORS.INVALID_CREDENTIALS" 
            });
        }

        // Generate token
        generateToken(user._id, res);

        return res.status(200).send({
            ok: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePic: user.profilePic
            }
        });
    } catch (error) {
        console.error("Error in login:", error);
        return res.status(500).send({ 
            ok: false, 
            code: "ERRORS.SERVER_ERROR",
            error: error.message 
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        return res.status(200).send({ ok: true });
    } catch (error) {
        console.error("Error in logout:", error);
        return res.status(500).send({ 
            ok: false, 
            code: "ERRORS.SERVER_ERROR",
            error: error.message 
        });
    }
};

export const checkAuth = async (req, res) => {
    try {
        return res.status(200).send({
            ok: true,
            data: {
                _id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                profilePic: req.user.profilePic
            }
        });
    } catch (error) {
        console.error("Error in check auth:", error);
        return res.status(500).send({ 
            ok: false, 
            code: "ERRORS.SERVER_ERROR",
            error: error.message 
        });
    }
}; 