import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { once } from "node:events";
import pg from "pg";
import nodemailer from "nodemailer";

// Opt in with SKILLBRIDGE_DB_TEST=1. All records and migrations live in a fresh schema.
test("account sessions, email changes, and project workflows over HTTP", {
  skip: process.env.SKILLBRIDGE_DB_TEST !== "1",
}, async (t) => {
  const dbUrl = new URL(process.env.DATABASE_URL);
  assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(dbUrl.hostname));
  const schema = "skillbridge_test_" + randomUUID().replaceAll("-", "");
  const admin = new pg.Client({ connectionString: dbUrl.href });
  await admin.connect();
  let db, server, created = false;
  try {
    await admin.query(`CREATE SCHEMA ${schema}`);
    created = true;
    dbUrl.searchParams.set("options", "-c search_path=" + schema);
    process.env.DATABASE_URL = dbUrl.href;
    execFileSync(process.execPath, [
      "./node_modules/node-pg-migrate/bin/node-pg-migrate.js", "up",
      "--schema", schema, "--migrations-schema", schema,
    ], { stdio: ["ignore", "pipe", "pipe"] });
    const mailbox = new Map();
    let mailAvailable = true;
    t.mock.method(nodemailer, "createTransport", () => ({
      sendMail: async ({ to, text }) => {
        if (!mailAvailable) throw new Error("Test SMTP unavailable");
        mailbox.set(to, text.match(/verify-email\/([a-f0-9]+)/)[1]);
      },
    }));
    Object.assign(process.env, {
      SMTP_HOST: "mail.invalid", SMTP_USER: "test", SMTP_PASS: "test",
      ACCESS_JWT_SECRET: randomUUID(), REFRESH_JWT_SECRET: randomUUID(),
    });
    db = (await import("../src/config/db.js")).pool;
    assert.equal((await db.query("SELECT current_schema() AS name")).rows[0].name, schema);
    const { app } = await import("../index.js");
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const base = `http://127.0.0.1:${server.address().port}/api`;
    async function request(method, path, status, body, cookies = "") {
      const res = await fetch(base + path, {
        method, headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", Cookie: cookies },
        body: body && JSON.stringify(body),
      });
      const data = await res.json();
      assert.equal(res.status, status, method + " " + path + ": " + JSON.stringify(data));
      return { data, cookies: res.headers.getSetCookie().map(v => v.split(";")[0]).join("; ") };
    }
    await request("GET", "/project/projects?page=1.5", 400);
    const password = "Sample1234";
    async function account(email) {
      const { data } = await request("POST", "/auth/register", 201, {
        username: "Test member", email, password, confirmPassword: password,
      });
      await request("POST", "/auth/verify-email/" + mailbox.get(email.toLowerCase()), 200);
      const { cookies } = await request("POST", "/auth/login", 200, { email, password });
      return { id: data.user.id, cookies };
    }
    const pending = { username: "Pending member", email: "pending@example.com", password, confirmPassword: password };
    mailAvailable = false;
    const registration = await request("POST", "/auth/register", 201, pending);
    assert.equal(registration.data.emailSent, false);
    assert.equal(registration.data.verificationToken, undefined);
    await request("POST", "/auth/login", 401, { email: pending.email, password: "incorrect" });
    const blocked = await request("POST", "/auth/login", 403, { email: pending.email, password });
    assert.equal(blocked.data.code, "EMAIL_VERIFICATION_REQUIRED");
    const resend = (status) => request("POST", "/auth/verify-email/resend", status, { email: pending.email });
    mailAvailable = true;
    await resend(200);
    const firstLink = mailbox.get(pending.email);
    await resend(200);
    const secondLink = mailbox.get(pending.email);
    assert.notEqual(firstLink, secondLink);
    await request("POST", "/auth/verify-email/" + firstLink, 400);
    mailAvailable = false;
    const failed = await resend(503);
    assert.equal(failed.data.verificationToken, undefined);
    await request("POST", "/auth/verify-email/" + secondLink, 200);
    await request("POST", "/auth/verify-email/" + secondLink, 400);
    mailAvailable = true;
    await resend(200);
    assert.equal(mailbox.get(pending.email), secondLink);
    await request("POST", "/auth/register", 201, { ...pending, email: "expired@example.com" });
    await db.query("UPDATE users SET email_verification_expires_at = CURRENT_TIMESTAMP WHERE email = $1", ["expired@example.com"]);
    await request("POST", "/auth/verify-email/" + mailbox.get("expired@example.com"), 400);
    const owner = await account("Owner@Example.com");
    const worker = await account("worker@example.com");
    const { data: anonymous } = await request("GET", "/auth/me", 200);
    assert.equal(anonymous.user, null);
    const refreshOnly = owner.cookies.split("; ").find(c => c.startsWith("refreshToken="));
    await request("GET", "/auth/me", 401, null, refreshOnly);
    owner.cookies = (await request("POST", "/auth/refresh", 200, null, refreshOnly)).cookies;
    await db.query("UPDATE users SET role='admin' WHERE id=$1", [owner.id]);
    await request("GET", "/admin/dashboard", 200, null, owner.cookies);
    await db.query("UPDATE users SET role='user' WHERE id=$1", [owner.id]);
    await request("GET", "/admin/dashboard", 403, null, owner.cookies);

    const category = (await db.query("INSERT INTO categories (name,price) VALUES ('Design',10) RETURNING id")).rows[0];
    for (const cancel of [true, false]) {
      const { data: { project } } = await request("POST", "/project/create", 201, {
        title: "Design project", description: "Create a design for the homepage.",
        budget: 100, deadline: "2099-01-01", category_id: category.id,
      }, owner.cookies);
      const { data: { proposal } } = await request("POST", "/proposal/projects/" + project.id, 201, {
        cover_letter: "I can complete this design project.", price: 90, delivery_days: 4,
      }, worker.cookies);
      if (cancel) await request("DELETE", "/project/delete/" + project.id, 200, null, owner.cookies);
      else await request("POST", "/proposal/" + proposal.id + "/accept", 200, null, owner.cookies);
      const { data } = await request("GET", "/proposal/mine", 200, null, worker.cookies);
      const result = data.proposals.find(p => p.id === proposal.id);
      assert.equal(result.status, cancel ? "rejected" : "accepted");
      assert.equal(result.project_status, cancel ? "cancelled" : "in_progress");
    }
    const otherDevice = (await request("POST", "/auth/login", 200, { email: "owner@example.com", password })).cookies;
    await request("POST", "/auth/change-password", 200, {
      currentPassword: password, newPassword: "Changed1234", confirmPassword: "Changed1234",
    }, owner.cookies);
    await request("GET", "/auth/profile", 401, null, otherDevice);
    await request("POST", "/auth/refresh", 401, null, otherDevice);

    const { data } = await request("PATCH", "/auth/profile", 200, {
      username: "Test worker", email: "new@example.com",
    }, worker.cookies);
    assert.equal(data.user.email_verified, false);
    await request("POST", "/auth/refresh", 401, null, worker.cookies);
    await request("POST", "/auth/verify-email/resend", 200, { email: "NEW@EXAMPLE.COM" });
    await request("POST", "/auth/verify-email/" + mailbox.get("new@example.com"), 200);
    const verified = await request("POST", "/auth/login", 200, { email: "new@example.com", password });
    await db.query("UPDATE users SET is_active=FALSE WHERE id=$1", [worker.id]);
    await request("GET", "/auth/profile", 401, null, verified.cookies);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    if (db) await db.end();
    try {
      if (created) await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    } finally {
      await admin.end();
    }
  }
});
