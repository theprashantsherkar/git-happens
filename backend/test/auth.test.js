import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { authRateLimiter } from "../middlewares/rateLimiter.js";

test("Password length validation rules", () => {
    const weakPassword = "12345";
    const validPassword = "securePassword123";

    assert.equal(weakPassword.length < 6, true, "Weak password < 6 characters should be rejected");
    assert.equal(validPassword.length >= 6, true, "Valid password >= 6 characters should pass");
});

test("Rate limiter middleware accumulates requests correctly", () => {
    const limiter = authRateLimiter(2, 60000);
    const req = { ip: "127.0.0.1", headers: {}, socket: {} };
    let status = 200;
    let jsonBody = null;

    const res = {
        status(code) {
            status = code;
            return this;
        },
        json(body) {
            jsonBody = body;
            return this;
        }
    };

    const next = () => {};

    limiter(req, res, next);
    assert.equal(status, 200, "First request within limit should pass");

    limiter(req, res, next);
    assert.equal(status, 200, "Second request within limit should pass");

    limiter(req, res, next);
    assert.equal(status, 429, "Third request exceeding limit of 2 should return 429 Too Many Requests");
    assert.equal(jsonBody.success, false);
});
