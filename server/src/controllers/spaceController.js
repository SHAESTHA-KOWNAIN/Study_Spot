const mongoose = require("mongoose");
const StudySpace = require("../models/StudySpace");
const SpaceReport = require("../models/SpaceReport");
const { REPORT_STATUSES } = require("../utils/reportConstants");

const SPACE_FIELDS = [
    "name",
    "building",
    "area",
    "description",
    "facilities",
    "quietZone",
    "groupStudyAllowed",
    "active"
];
const REQUIRED_FIELDS = ["name", "building", "area", "description", "facilities"];

function sendError(res, status, message) {
    return res.status(status).json({ success: false, message });
}

function serializeSpace(space) {
    const value = typeof space.toObject === "function" ? space.toObject() : space;
    return {
        id: String(value._id),
        name: value.name,
        building: value.building,
        area: value.area,
        description: value.description,
        facilities: value.facilities,
        quietZone: value.quietZone,
        groupStudyAllowed: value.groupStudyAllowed,
        active: value.active,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt
    };
}

function validateSpaceData(body, { partial = false } = {}) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "Request body must be a JSON object.";
    }

    const unknownField = Object.keys(body).find((field) => !SPACE_FIELDS.includes(field));
    if (unknownField) return `Unknown study-space field: ${unknownField}.`;

    if (partial && Object.keys(body).length === 0) {
        return "At least one study-space field is required.";
    }

    const fieldsToValidate = new Set([
        ...Object.keys(body),
        ...(partial ? [] : REQUIRED_FIELDS)
    ]);
    for (const field of fieldsToValidate) {
        const value = body[field];
        if (["name", "building", "area", "description"].includes(field)) {
            if (typeof value !== "string" || !value.trim()) {
                return `${field[0].toUpperCase()}${field.slice(1)} must be a non-empty string.`;
            }
            const maximum = field === "description" ? 2000 : 120;
            if (value.trim().length > maximum) {
                return `${field[0].toUpperCase()}${field.slice(1)} must be ${maximum} characters or fewer.`;
            }
        } else if (field === "facilities") {
            if (!Array.isArray(value) || value.some((facility) =>
                typeof facility !== "string"
                || !facility.trim()
                || facility.trim().length > 80
            )) {
                return "Facilities must be a list of non-empty strings of 80 characters or fewer.";
            }
        } else if (["quietZone", "groupStudyAllowed", "active"].includes(field)
            && typeof value !== "boolean") {
            return `${field} must be a boolean.`;
        }
    }

    return null;
}

function isValidId(id) {
    return mongoose.isObjectIdOrHexString(id);
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateBooleanFilter(value, field) {
    if (value === undefined || value === "") return { value: undefined };
    if (value === "true") return { value: true };
    if (value === "false") return { value: false };
    return { error: `${field} must be true or false.` };
}

async function getSpaces(req, res) {
    const { search, building, area, facility, status, includeInactive } = req.query;
    for (const [field, value] of Object.entries({ search, building, area, facility, status, includeInactive })) {
        if (value !== undefined && typeof value !== "string") {
            return sendError(res, 400, `${field} must be a single string value.`);
        }
    }

    if (includeInactive !== undefined && !["true", "false"].includes(includeInactive)) {
        return sendError(res, 400, "includeInactive must be true or false.");
    }

    const quietZone = validateBooleanFilter(req.query.quietZone, "quietZone");
    const groupStudyAllowed = validateBooleanFilter(req.query.groupStudyAllowed, "groupStudyAllowed");
    if (quietZone.error || groupStudyAllowed.error) {
        return sendError(res, 400, quietZone.error || groupStudyAllowed.error);
    }
    if (status && !REPORT_STATUSES.includes(status)) {
        return sendError(res, 400, "Choose a valid availability status.");
    }

    const filter = {};
    if (includeInactive !== "true") filter.active = true;
    if (building?.trim()) filter.building = building.trim();
    if (area?.trim()) filter.area = area.trim();
    if (facility?.trim()) filter.facilities = facility.trim();
    if (quietZone.value !== undefined) filter.quietZone = quietZone.value;
    if (groupStudyAllowed.value !== undefined) filter.groupStudyAllowed = groupStudyAllowed.value;

    const searchTerm = search?.trim();
    if (searchTerm) {
        const expression = new RegExp(escapeRegex(searchTerm), "i");
        filter.$or = [
            { name: expression },
            { building: expression },
            { area: expression },
            { description: expression }
        ];
    }

    try {
        if (status) {
            const latestReports = await SpaceReport.aggregate([
                { $sort: { reportedAt: -1, _id: -1 } },
                { $group: { _id: "$spaceId", status: { $first: "$status" } } },
                { $match: { status } },
                { $project: { _id: 1 } }
            ]);
            filter._id = { $in: latestReports.map((report) => report._id) };
        }

        const spaces = await StudySpace.find(filter).sort({ name: 1, _id: 1 }).exec();
        return res.status(200).json({
            success: true,
            data: { spaces: spaces.map(serializeSpace) }
        });
    } catch (error) {
        console.error("Study-space listing failed:", error);
        return sendError(res, 500, "Unable to retrieve study spaces.");
    }
}

async function getSpace(req, res) {
    if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid study space ID.");

    try {
        const space = await StudySpace.findOne({ _id: req.params.id, active: true }).exec();
        if (!space) return sendError(res, 404, "Study space not found.");
        return res.status(200).json({
            success: true,
            data: { space: serializeSpace(space) }
        });
    } catch (error) {
        console.error("Study-space retrieval failed:", error);
        return sendError(res, 500, "Unable to retrieve study space.");
    }
}

async function createSpace(req, res) {
    const validationError = validateSpaceData(req.body);
    if (validationError) return sendError(res, 400, validationError);

    try {
        const space = await StudySpace.create({
            ...req.body,
            active: req.body.active ?? true
        });
        return res.status(201).json({
            success: true,
            data: { space: serializeSpace(space) }
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
            return sendError(res, 400, error.message);
        }
        console.error("Study-space creation failed:", error);
        return sendError(res, 500, "Unable to create study space.");
    }
}

async function updateSpace(req, res) {
    if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid study space ID.");
    const validationError = validateSpaceData(req.body, { partial: true });
    if (validationError) return sendError(res, 400, validationError);

    try {
        const space = await StudySpace.findById(req.params.id).exec();
        if (!space) return sendError(res, 404, "Study space not found.");

        Object.assign(space, req.body);
        await space.save();
        return res.status(200).json({
            success: true,
            data: { space: serializeSpace(space) }
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
            return sendError(res, 400, error.message);
        }
        console.error("Study-space update failed:", error);
        return sendError(res, 500, "Unable to update study space.");
    }
}

async function deactivateSpace(req, res) {
    if (!isValidId(req.params.id)) return sendError(res, 400, "Invalid study space ID.");

    try {
        const space = await StudySpace.findById(req.params.id).exec();
        if (!space) return sendError(res, 404, "Study space not found.");

        space.active = false;
        await space.save();
        return res.status(200).json({
            success: true,
            data: { space: serializeSpace(space) }
        });
    } catch (error) {
        console.error("Study-space deactivation failed:", error);
        return sendError(res, 500, "Unable to deactivate study space.");
    }
}

module.exports = {
    createSpace,
    deactivateSpace,
    getSpace,
    getSpaces,
    updateSpace
};
