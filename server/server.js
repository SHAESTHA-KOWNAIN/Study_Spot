const os = require("node:os");
const path = require("node:path");
const privateConfigDirectory = process.env.LOCALAPPDATA || path.join(os.homedir(), ".config");
require("dotenv").config({
    path: path.join(privateConfigDirectory, "StudySpot", "server.env")
});
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = require("./app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`StudySpot server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();