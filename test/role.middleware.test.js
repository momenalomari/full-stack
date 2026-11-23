import test from "node:test";
import assert from "node:assert/strict";
import { requireRole } from "../src/middleware/role.middleware.js";

test("requireRole allows a matching role", () => {
  const middleware = requireRole("moderator", "admin");
  let reached = false;
  middleware(
    { user: { role: "moderator" } },
    {},
    () => {
      reached = true;
    },
  );
  assert.equal(reached, true);
});

test("requireRole rejects a missing or unauthorized role", () => {
  for (const req of [{}, { user: { role: "user" } }]) {
    let status;
    const res = {
      status(code) {
        status = code;
        return this;
      },
      json() {
        return this;
      },
    };
    requireRole("moderator", "admin")(req, res, () => {});
    assert.equal(status, req.user ? 403 : 401);
  }
});
