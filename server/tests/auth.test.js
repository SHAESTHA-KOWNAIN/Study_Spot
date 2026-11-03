const { after, before, beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

const app = require("../app");
const User = require("../src/models/User");
const ModeratorInvitation = require("../src/models/ModeratorInvitation");
const {
    createModeratorInvitation
} = require("../src/services/moderatorInvitationService");

let mongoServer;
let originalJwtSecret;

before(async () => {
    originalJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "studyspot-test-secret-for-automated-tests";

    mongoServer = await MongoMemoryReplSet.create({
        replSet: {
            count: 1,
            storageEngine: "wiredTiger"
        }
    });

    await mongoose.connect(mongoServer.getUri());
});

after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();

    if (originalJwtSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalJwtSecret;
    }
});

beforeEach(async () => {
    await User.deleteMany({});
    await ModeratorInvitation.deleteMany({});
});

describe("authentication API", () => {
    const account = {
        name: "Test Student",
        email: "student@example.com",
        password: "StrongPass123!",
        confirmPassword: "StrongPass123!"
    };

    it("registers a new member and returns a JWT", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send(account);

        assert.equal(response.status, 201);
        assert.equal(response.body.success, true);
        assert.equal(response.body.data.user.name, account.name);
        assert.equal(response.body.data.user.email, account.email);
        assert.equal(response.body.data.user.role, "member");
        assert.ok(response.body.data.token);

        const savedUser = await User.findOne({ email: account.email })
            .select("+passwordHash");

        assert.ok(savedUser);
        assert.notEqual(savedUser.passwordHash, account.password);
        assert.equal(savedUser.passwordHash.startsWith("$2"), true);
    });

    it("rejects duplicate email registration", async () => {
        await request(app).post("/api/auth/register").send(account);

        const response = await request(app)
            .post("/api/auth/register")
            .send(account);

        assert.equal(response.status, 409);
        assert.equal(await User.countDocuments(), 1);
    });

    it("rejects mismatched passwords", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                ...account,
                confirmPassword: "DifferentPass123!"
            });

        assert.equal(response.status, 400);
        assert.equal(await User.countDocuments(), 0);
    });

    it("logs in with valid credentials", async () => {
        await request(app).post("/api/auth/register").send(account);

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: account.email,
                password: account.password
            });

        assert.equal(response.status, 200);
        assert.ok(response.body.data.token);
        assert.equal(response.body.data.user.email, account.email);
    });

    it("rejects incorrect login credentials", async () => {
        await request(app).post("/api/auth/register").send(account);

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: account.email,
                password: "WrongPassword123!"
            });

        assert.equal(response.status, 401);
    });

    it("returns the current user for a valid JWT", async () => {
        const registration = await request(app)
            .post("/api/auth/register")
            .send(account);

        const token = registration.body.data.token;

        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        assert.equal(response.status, 200);
        assert.equal(response.body.data.user.email, account.email);
        assert.equal(response.body.data.user.role, "member");
        assert.equal(JSON.stringify(response.body).includes("passwordHash"), false);
    });

    it("rejects missing and invalid JWTs", async () => {
        const missing = await request(app).get("/api/auth/me");

        const invalid = await request(app)
            .get("/api/auth/me")
            .set("Authorization", "Bearer invalid-token");

        assert.equal(missing.status, 401);
        assert.equal(invalid.status, 401);
    });

    it("rejects a token when its user no longer exists", async () => {
        const registration = await request(app)
            .post("/api/auth/register")
            .send(account);

        const token = registration.body.data.token;
        await User.deleteMany({});

        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        assert.equal(response.status, 401);
    });

    it("registers a moderator using a valid invitation", async () => {
        const invitation = await createModeratorInvitation();

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test Moderator",
                email: "moderator@example.com",
                password: "StrongPass123!",
                confirmPassword: "StrongPass123!",
                invitationToken: invitation.token
            });

        assert.equal(response.status, 201);
        assert.equal(response.body.data.user.role, "moderator");

        const savedUser = await User.findOne({
            email: "moderator@example.com"
        });

        assert.equal(savedUser.role, "moderator");
    });

    it("rejects an invalid moderator invitation", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Invalid Moderator",
                email: "invalid@example.com",
                password: "StrongPass123!",
                confirmPassword: "StrongPass123!",
                invitationToken: "invalid-token"
            });

        assert.equal(response.status, 400);
        assert.equal(await User.countDocuments(), 0);
    });

    it("rejects an expired moderator invitation", async () => {
        const invitation = await createModeratorInvitation();

        const crypto = require("node:crypto");
        const tokenHash = crypto
            .createHash("sha256")
            .update(invitation.token)
            .digest("hex");

        await ModeratorInvitation.updateOne(
            { tokenHash },
            { $set: { expiresAt: new Date(Date.now() - 1000) } }
        );

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Expired Moderator",
                email: "expired@example.com",
                password: "StrongPass123!",
                confirmPassword: "StrongPass123!",
                invitationToken: invitation.token
            });

        assert.equal(response.status, 400);
        assert.equal(await User.countDocuments(), 0);
    });

    it("rejects reuse of an already-used invitation", async () => {
        const invitation = await createModeratorInvitation();

        const register = (email) => request(app)
            .post("/api/auth/register")
            .send({
                name: "Test Moderator",
                email,
                password: "StrongPass123!",
                confirmPassword: "StrongPass123!",
                invitationToken: invitation.token
            });

        const first = await register("first@example.com");
        const second = await register("second@example.com");

        assert.equal(first.status, 201);
        assert.equal(first.body.data.user.role, "moderator");
        assert.equal(second.status, 400);
        assert.equal(await User.countDocuments(), 1);
    });

    it("does not consume an invitation when email already exists", async () => {
        await request(app)
            .post("/api/auth/register")
            .send(account);

        const invitation = await createModeratorInvitation();

        const duplicate = await request(app)
            .post("/api/auth/register")
            .send({
                ...account,
                invitationToken: invitation.token
            });

        assert.equal(duplicate.status, 409);

        const retry = await request(app)
            .post("/api/auth/register")
            .send({
                name: "New Moderator",
                email: "newmoderator@example.com",
                password: "StrongPass123!",
                confirmPassword: "StrongPass123!",
                invitationToken: invitation.token
            });

        assert.equal(retry.status, 201);
        assert.equal(retry.body.data.user.role, "moderator");
    });

    it("allows only moderators to generate invitations", async () => {
        const memberRegistration = await request(app)
            .post("/api/auth/register")
            .send(account);

        const memberToken = memberRegistration.body.data.token;

        const response = await request(app)
            .post("/api/auth/moderator-invitations")
            .set("Authorization", `Bearer ${memberToken}`);

        assert.equal(response.status, 403);
    });

    it("rejects unauthenticated moderator invitation requests", async () => {
    const response = await request(app)
        .post("/api/auth/moderator-invitations");

    assert.equal(response.status, 401);
    });

});
