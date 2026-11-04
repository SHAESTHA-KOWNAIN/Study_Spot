const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../app");

describe("CORS configuration", () => {
    it("allows the deployed Vercel origin and handles login preflight", async () => {
        const response = await request(app)
            .options("/api/auth/login")
            .set("Origin", "https://study-spot-gamma-ten.vercel.app")
            .set("Access-Control-Request-Method", "POST")
            .set("Access-Control-Request-Headers", "content-type");

        assert.equal(response.status, 204);
        assert.equal(
            response.headers["access-control-allow-origin"],
            "https://study-spot-gamma-ten.vercel.app"
        );
        assert.match(
            response.headers["access-control-allow-methods"],
            /POST/
        );
        assert.match(
            response.headers["access-control-allow-headers"],
            /content-type/i
        );
    });
});
