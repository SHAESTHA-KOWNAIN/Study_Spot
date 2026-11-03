const crypto = require("node:crypto");
const os = require("node:os");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const StudySpace = require("../src/models/StudySpace");
const SpaceReport = require("../src/models/SpaceReport");
const User = require("../src/models/User");
const { REPORT_STATUSES } = require("../src/utils/reportConstants");

const SEED_REPORTER_ID = new mongoose.Types.ObjectId("671000000000000000000001");
const SEED_REPORTER_EMAIL = "studyspot-seed-reporter@studyspot.local";

const STUDY_SPACES = [
    {
        id: "671000000000000000000101",
        reportId: "671000000000000000000201",
        name: "Central Library Reading Hall",
        building: "Main Block",
        area: "Level 2 · East Wing",
        description: "A quiet reading floor with individual desks and natural light.",
        facilities: ["Power outlets", "Wi-Fi", "Printing"],
        quietZone: true,
        groupStudyAllowed: false,
        status: "Available",
        note: "Open desks are available near the east windows.",
        reportedMinutesAgo: 12
    },
    {
        id: "671000000000000000000102",
        reportId: "671000000000000000000202",
        name: "Digital Learning Commons",
        building: "Computer Centre",
        area: "Ground Floor",
        description: "Computer-equipped workstations near the campus IT help desk.",
        facilities: ["Computers", "Power outlets", "Wi-Fi"],
        quietZone: false,
        groupStudyAllowed: true,
        status: "Moderately Busy",
        note: "Some workstations and shared tables are still open.",
        reportedMinutesAgo: 24
    },
    {
        id: "671000000000000000000103",
        reportId: "671000000000000000000203",
        name: "Engineering Reading Room",
        building: "Engineering Block",
        area: "Level 3",
        description: "A focused study room with long tables and whiteboards.",
        facilities: ["Whiteboards", "Power outlets", "Wi-Fi"],
        quietZone: true,
        groupStudyAllowed: true,
        status: "Busy",
        note: "Most tables are occupied during the afternoon study period.",
        reportedMinutesAgo: 35
    },
    {
        id: "671000000000000000000104",
        reportId: "671000000000000000000204",
        name: "Science Atrium Study Area",
        building: "Science Block",
        area: "Atrium · North",
        description: "An open, light-filled area for short study sessions between classes.",
        facilities: ["Wi-Fi", "Power outlets", "Water refill"],
        quietZone: false,
        groupStudyAllowed: true,
        status: "Temporarily Closed",
        note: "Closed temporarily for a scheduled campus event.",
        reportedMinutesAgo: 8
    },
    {
        id: "671000000000000000000105",
        reportId: "671000000000000000000205",
        name: "Graduate Scholars Room",
        building: "Graduate Centre",
        area: "Level 1 · Room 114",
        description: "A calm shared room with individual carrels for longer research sessions.",
        facilities: ["Power outlets", "Wi-Fi", "Lockers"],
        quietZone: true,
        groupStudyAllowed: false,
        status: "Available",
        note: "Several carrels are free.",
        reportedMinutesAgo: 18
    }
];

function loadEnvironment() {
    const privateConfigDirectory = process.env.LOCALAPPDATA || path.join(os.homedir(), ".config");
    require("dotenv").config({
        path: path.join(privateConfigDirectory, "StudySpot", "server.env")
    });
    require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
}

async function seedData() {
    let reporter = await User.findById(SEED_REPORTER_ID);
    if (reporter && reporter.email !== SEED_REPORTER_EMAIL) {
        throw new Error("The sample reporter ID is already in use.");
    }
    if (!reporter) {
        const conflictingEmail = await User.findOne({ email: SEED_REPORTER_EMAIL });
        if (conflictingEmail) {
            throw new Error("The sample reporter email is already in use.");
        }

        const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
        reporter = await User.findOneAndUpdate(
            { _id: SEED_REPORTER_ID },
            {
                $setOnInsert: {
                    name: "StudySpot Sample Reporter",
                    email: SEED_REPORTER_EMAIL,
                    passwordHash,
                    role: "member"
                }
            },
            { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true }
        );
    }

    for (const sample of STUDY_SPACES) {
        const { id, reportId, status, note, reportedMinutesAgo, ...spaceFields } = sample;
        const spaceId = new mongoose.Types.ObjectId(id);
        await StudySpace.findOneAndUpdate(
            { _id: spaceId },
            { $set: spaceFields },
            { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true }
        );

        if (!REPORT_STATUSES.includes(status)) {
            throw new Error(`Invalid seeded report status for ${spaceFields.name}.`);
        }

        await SpaceReport.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(reportId) },
            {
                $set: {
                    spaceId,
                    reporterId: reporter._id,
                    status,
                    note,
                    reportedAt: new Date(Date.now() - reportedMinutesAgo * 60 * 1000)
                }
            },
            { upsert: true, returnDocument: "after", runValidators: true }
        );
    }

    console.log(`Seeded ${STUDY_SPACES.length} study spaces and matching sample reports.`);
}

async function main() {
    loadEnvironment();
    try {
        await connectDB();
        await seedData();
    } catch (error) {
        console.error("StudySpot seed failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

if (require.main === module) {
    main();
}

module.exports = { seedData };
