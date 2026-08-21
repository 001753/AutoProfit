import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/auth.js";

test("password hashing is salted and verifies only the original password", async () => {
  const encoded = await hashPassword("correct horse battery staple");
  assert.notEqual(encoded, "correct horse battery staple");
  assert.equal(await verifyPassword("correct horse battery staple", encoded), true);
  assert.equal(await verifyPassword("wrong password", encoded), false);
});