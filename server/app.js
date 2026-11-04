const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const createReportRoutes = require("./src/routes/reportRoutes");
const createSpaceRoutes = require("./src/routes/spaceRoutes");
const { authenticate } = require("./src/middleware/authMiddleware");
require("./src/models/StudySpace");

const app = express();

const configuredOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedOrigins = new Set([
    "http://localhost:5173",
    "https://study-spot-gamma-ten.vercel.app",
    ...configuredOrigins
]);

// The cors middleware responds to browser OPTIONS preflight requests before
// the API routes. Only the local client, production client, and configured
// client origins receive CORS permission.
app.use(cors({
    origin: (origin, callback) => {
        callback(null, !origin || allowedOrigins.has(origin));
    },
    optionsSuccessStatus: 204
}));

app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Study-space and report routes
app.use("/api/spaces", createSpaceRoutes({ authenticate }));
app.use("/api/spaces", createReportRoutes({ authenticate }));

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "StudySpot backend is running",
        status: "OK"
    });
});

// Default route
app.get("/", (req, res) => {
    res.send("Welcome to StudySpot API");
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// Error handler
app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Request body must be valid JSON."
        });
    }

    if (error.status === 413) {
        return res.status(413).json({
            success: false,
            message: "Request body is too large."
        });
    }

    console.error("Unhandled API error:", error);

    return res.status(500).json({
        success: false,
        message: "An unexpected server error occurred."
    });
});

module.exports = app;
