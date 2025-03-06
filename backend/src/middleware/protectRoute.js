import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).send({ 
                ok: false, 
                code: "ERRORS.UNAUTHORIZED" 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).send({ 
                ok: false, 
                code: "ERRORS.INVALID_TOKEN" 
            });
        }

        // Get user from token
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).send({ 
                ok: false, 
                code: "ERRORS.USER_NOT_FOUND" 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        return res.status(401).send({ 
            ok: false, 
            code: "ERRORS.UNAUTHORIZED",
            error: error.message 
        });
    }
}; 