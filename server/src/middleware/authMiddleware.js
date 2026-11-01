const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    const token = authHeader.slice(7);

    let decoded;

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }

        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.message === "JWT_SECRET is not configured.") {
            console.error(error.message);
            return res.status(500).json({
                success: false,
                message: "Authentication is not configured."
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }

    try {
        const user = await User.findById(decoded.sub);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account no longer exists."
            });
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action."
            });
        }

        next();
    };
}

module.exports = { authenticate, authorizeRoles };
