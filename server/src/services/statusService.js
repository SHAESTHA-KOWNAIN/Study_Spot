const SpaceReport = require("../models/SpaceReport");

const DEFAULT_STALE_AFTER_MINUTES = 60;

function getStaleAfterMinutes() {
    const configured = process.env.STATUS_STALE_AFTER_MINUTES;
    if (configured === undefined || configured.trim() === "") {
        return DEFAULT_STALE_AFTER_MINUTES;
    }

    const minutes = Number(configured);
    if (!Number.isFinite(minutes) || minutes < 0) {
        throw new Error("STATUS_STALE_AFTER_MINUTES must be a non-negative number.");
    }
    return minutes;
}

function calculateFreshness(reportedAt, now = new Date(), thresholdMinutes = getStaleAfterMinutes()) {
    if (reportedAt === null || reportedAt === undefined) return "No Report";
    if (!Number.isFinite(thresholdMinutes) || thresholdMinutes < 0) {
        throw new TypeError("Freshness threshold must be a non-negative number of minutes.");
    }

    const reportTime = new Date(reportedAt).getTime();
    const currentTime = new Date(now).getTime();
    if (!Number.isFinite(reportTime) || !Number.isFinite(currentTime)) {
        throw new TypeError("Report and current timestamps must be valid dates.");
    }

    return currentTime - reportTime >= thresholdMinutes * 60 * 1000
        ? "Stale"
        : "Fresh";
}

async function getLatestReport(spaceId) {
    return SpaceReport.findOne({ spaceId })
        .sort({ reportedAt: -1, _id: -1 })
        .populate({ path: "reporterId", select: "name" })
        .exec();
}

async function getLatestStatus(spaceId, now = new Date()) {
    const report = await getLatestReport(spaceId);
    return {
        report,
        status: report?.status ?? null,
        reportedAt: report?.reportedAt ?? null,
        freshness: calculateFreshness(report?.reportedAt, now)
    };
}

module.exports = {
    calculateFreshness,
    getLatestReport,
    getLatestStatus,
    getStaleAfterMinutes
};
