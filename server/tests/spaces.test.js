const { after, before, beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const SpaceReport = require("../src/models/SpaceReport");
const StudySpace = require("../src/models/StudySpace");
const User = require("../src/models/User");

let mongoServer;
let originalJwtSecret;
let member;
let moderator;
let memberToken;
let moderatorToken;

const spaceDetails = {
    name: "Central Library",
    building: "Main Block",
    area: "Level 2 · East Wing",
    description: "A bright reading floor.",
    facilities: ["Power outlets", "Wi-Fi"],
    quietZone: true,
    groupStudyAllowed: false
};

function tokenFor(user) {
    return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET);
}

function authorized(method, path, token = moderatorToken) {
    const call = request(app)[method](path);
    return token ? call.set("Authorization", `Bearer ${token}`) : call;
}

before(async () => {
    originalJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "studyspace-test-secret";
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
});

beforeEach(async () => {
    await Promise.all([
        StudySpace.deleteMany({}),
        SpaceReport.deleteMany({}),
        User.deleteMany({})
    ]);
    [member, moderator] = await User.create([
        { name: "Member", email: "member@example.edu", passwordHash: "hash", role: "member" },
        { name: "Moderator", email: "moderator@example.edu", passwordHash: "hash", role: "moderator" }
    ]);
    memberToken = tokenFor(member);
    moderatorToken = tokenFor(moderator);
});

describe("study-space model registration", () => {
    it("registers the StudySpace model and its report-reference name", () => {
        assert.equal(mongoose.models.StudySpace, StudySpace);
        assert.equal(SpaceReport.schema.path("spaceId").options.ref, "StudySpace");
    });
});

describe("study-space listing and retrieval", () => {
    it("lists active spaces using the frontend response fields and filters", async () => {
        const matchingSpace = await StudySpace.create(spaceDetails);
        await StudySpace.create({
            ...spaceDetails,
            name: "Science Room",
            building: "Science Block",
            area: "Atrium",
            facilities: ["Whiteboards"],
            quietZone: false
        });
        await StudySpace.create({ ...spaceDetails, name: "Inactive Room", active: false });
        await SpaceReport.create({
            spaceId: matchingSpace.id,
            reporterId: member.id,
            status: "Busy"
        });

        const response = await request(app)
            .get("/api/spaces")
            .query({
                search: "library",
                building: "Main Block",
                area: "Level 2 · East Wing",
                facility: "Wi-Fi",
                quietZone: "true",
                groupStudyAllowed: "false",
                status: "Busy"
            });

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.equal(response.body.data.spaces.length, 1);
        assert.deepEqual(response.body.data.spaces[0], {
            id: matchingSpace.id,
            ...spaceDetails,
            active: true,
            createdAt: matchingSpace.createdAt.toISOString(),
            updatedAt: matchingSpace.updatedAt.toISOString()
        });
    });

    it("only lets moderators include inactive spaces", async () => {
        await StudySpace.create([
            spaceDetails,
            { ...spaceDetails, name: "Inactive Room", active: false }
        ]);

        assert.equal((await request(app).get("/api/spaces?includeInactive=true")).status, 401);
        assert.equal((await authorized("get", "/api/spaces?includeInactive=true", memberToken)).status, 403);
        const response = await authorized("get", "/api/spaces?includeInactive=true");
        assert.equal(response.status, 200);
        assert.equal(response.body.data.spaces.length, 2);
    });

    it("gets one active space and rejects invalid or missing IDs", async () => {
        const space = await StudySpace.create(spaceDetails);
        assert.equal((await request(app).get("/api/spaces/not-an-id")).status, 400);
        const response = await request(app).get(`/api/spaces/${space.id}`);
        assert.equal(response.status, 200);
        assert.equal(response.body.data.space.id, space.id);
        assert.equal((await request(app).get(`/api/spaces/${new mongoose.Types.ObjectId()}`)).status, 404);
    });

    it("validates directory filter values", async () => {
        assert.equal((await request(app).get("/api/spaces?quietZone=yes")).status, 400);
        assert.equal((await request(app).get("/api/spaces?status=unknown")).status, 400);
    });
});

describe("moderator study-space management", () => {
    it("requires a moderator to create a valid study space", async () => {
        assert.equal((await request(app).post("/api/spaces").send(spaceDetails)).status, 401);
        assert.equal((await authorized("post", "/api/spaces", memberToken).send(spaceDetails)).status, 403);

        const response = await authorized("post", "/api/spaces").send(spaceDetails);
        assert.equal(response.status, 201);
        assert.equal(response.body.success, true);
        assert.equal(response.body.data.space.name, spaceDetails.name);
        assert.equal(response.body.data.space.active, true);
        assert.equal(await StudySpace.countDocuments(), 1);
    });

    it("rejects malformed, incomplete, and unknown creation fields", async () => {
        for (const body of [
            { ...spaceDetails, facilities: "Wi-Fi" },
            { ...spaceDetails, name: " " },
            { ...spaceDetails, active: "false" },
            { ...spaceDetails, role: "moderator" }
        ]) {
            const response = await authorized("post", "/api/spaces").send(body);
            assert.equal(response.status, 400);
            assert.equal(response.body.success, false);
        }
        assert.equal(await StudySpace.countDocuments(), 0);
    });

    it("updates only validated supplied fields and requires moderator access", async () => {
        const space = await StudySpace.create(spaceDetails);
        assert.equal((await authorized("patch", `/api/spaces/${space.id}`, memberToken).send({ area: "Level 3" })).status, 403);
        const response = await authorized("patch", `/api/spaces/${space.id}`).send({
            area: "Level 3",
            facilities: ["Wi-Fi", "Lockers"]
        });
        assert.equal(response.status, 200);
        assert.equal(response.body.data.space.area, "Level 3");
        assert.deepEqual(response.body.data.space.facilities, ["Wi-Fi", "Lockers"]);
        assert.equal(response.body.data.space.name, spaceDetails.name);

        assert.equal((await authorized("patch", "/api/spaces/invalid").send({ area: "Level 3" })).status, 400);
        assert.equal((await authorized("patch", `/api/spaces/${space.id}`).send({ area: " " })).status, 400);
        assert.equal((await authorized("patch", `/api/spaces/${space.id}`).send({})).status, 400);
    });

    it("deactivates spaces instead of deleting them, preserving report history", async () => {
        const space = await StudySpace.create(spaceDetails);
        await SpaceReport.create({
            spaceId: space.id,
            reporterId: member.id,
            status: "Available"
        });

        assert.equal((await authorized("delete", `/api/spaces/${space.id}`, memberToken)).status, 403);
        const response = await authorized("delete", `/api/spaces/${space.id}`);
        assert.equal(response.status, 200);
        assert.equal(response.body.data.space.active, false);
        assert.equal(await StudySpace.countDocuments({ _id: space.id }), 1);
        assert.equal(await SpaceReport.countDocuments({ spaceId: space.id }), 1);
        assert.equal((await request(app).get("/api/spaces")).body.data.spaces.length, 0);
        assert.equal((await request(app).get(`/api/spaces/${space.id}`)).status, 404);
    });
});
