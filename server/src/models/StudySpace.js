const mongoose = require("mongoose");

const studySpaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 120
        },
        building: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 120
        },
        area: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 120
        },
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 2000
        },
        facilities: {
            type: [{
                type: String,
                trim: true,
                minlength: 1,
                maxlength: 80
            }],
            default: []
        },
        quietZone: {
            type: Boolean,
            default: false,
            required: true
        },
        groupStudyAllowed: {
            type: Boolean,
            default: false,
            required: true
        },
        active: {
            type: Boolean,
            default: true,
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

studySpaceSchema.index({ active: 1, building: 1, area: 1 });
studySpaceSchema.index({ facilities: 1 });

module.exports = mongoose.models.StudySpace
    || mongoose.model("StudySpace", studySpaceSchema);
