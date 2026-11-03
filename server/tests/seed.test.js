const { after, before, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const SpaceReport = require("../src/models/SpaceReport");
const StudySpace = require("../src/models/StudySpace");
const User = require("../src/models/User");
const { seedData } = require("../scripts/seed");
const { REPORT_STATUSES } = require("../src/utils/reportConstants");

let mongoServer;

before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("sample data seed", () => {
    it("upserts schema-valid spaces and related reports without duplicates", async () => {
        await seedData();
        await seedData();

        assert.equal(await StudySpace.countDocuments(), 5);
        assert.equal(await SpaceReport.countDocuments(), 5);
        assert.equal(await User.countDocuments(), 1);

        const spaces = await StudySpace.find({}).lean();
        const reports = await SpaceReport.find({}).lean();
        const expectedSpaceFields = [
            "_id",
            "name",
            "building",
            "area",
            "description",
            "facilities",
            "quietZone",
            "groupStudyAllowed",
            "active",
            "createdAt",
            "updatedAt"
        ].sort();

        for (const space of spaces) {
            assert.deepEqual(Object.keys(space).sort(), expectedSpaceFields);
            assert.ok(space.name);
            assert.ok(space.building);
            assert.ok(space.area);
            assert.ok(space.description);
            assert.ok(space.facilities.length > 0);
            assert.equal(typeof space.quietZone, "boolean");
            assert.equal(typeof space.groupStudyAllowed, "boolean");
            assert.equal(space.active, true);
            assert.ok(space.createdAt instanceof Date);
            assert.ok(space.updatedAt instanceof Date);
        }

        assert.deepEqual(
            [...new Set(reports.map((report) => report.status))].sort(),
            [...REPORT_STATUSES].sort()
        );
        assert.ok(reports.every((report) =>
            spaces.some((space) => space._id.equals(report.spaceId))
            && report.reportedAt instanceof Date
            && report.reporterId
        ));
    });
});
