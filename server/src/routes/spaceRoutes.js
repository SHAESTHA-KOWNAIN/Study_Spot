const express = require("express");
const {
    createSpace,
    deactivateSpace,
    getSpace,
    getSpaces,
    updateSpace
} = require("../controllers/spaceController");
const { authorizeRoles } = require("../middleware/authMiddleware");

function authenticationNotConfigured(req, res) {
    return res.status(503).json({
        success: false,
        message: "Study-space management is unavailable until authentication middleware is configured."
    });
}

function createSpaceRoutes({ authenticate } = {}) {
    const router = express.Router();
    const requireAuthentication = authenticate || authenticationNotConfigured;
    const moderatorOnly = [requireAuthentication, authorizeRoles("moderator")];

    router.get("/", (req, res, next) => {
        if (req.query.includeInactive === undefined || req.query.includeInactive === "false") {
            return next();
        }
        if (req.query.includeInactive !== "true") {
            return res.status(400).json({
                success: false,
                message: "includeInactive must be true or false."
            });
        }
        return requireAuthentication(req, res, () =>
            authorizeRoles("moderator")(req, res, next));
    }, getSpaces);
    router.get("/:id", getSpace);
    router.post("/", ...moderatorOnly, createSpace);
    router.patch("/:id", ...moderatorOnly, updateSpace);
    router.delete("/:id", ...moderatorOnly, deactivateSpace);

    return router;
}

module.exports = createSpaceRoutes;
