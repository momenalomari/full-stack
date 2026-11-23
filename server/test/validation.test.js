import test from "node:test";
import assert from "node:assert/strict";
import { createUserSchema, loginUserSchema } from "../src/validation/auth.validation.js";

test("registration rejects short usernames", () => {
  const result = createUserSchema.validate({
    username: "x",
    email: "user@example.com",
    password: "password123",
    confirmPassword: "password123",
  });
  assert.ok(result.error);
});

test("registration accepts valid account data", () => {
  const result = createUserSchema.validate({
    username: "Skill User",
    email: "user@example.com",
    password: "password123",
    confirmPassword: "password123",
  });
  assert.equal(result.error, undefined);
});

test("login requires a valid email and password", () => {
  assert.ok(loginUserSchema.validate({
    email: "not-an-email",
    password: "",
  }).error);

  assert.equal(loginUserSchema.validate({
    email: "user@example.com",
    password: "password123",
  }).error, undefined);
});
