import test, { after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { closeDb, query } from "../src/db.js";
import { enqueue, claim, complete, fail } from "../src/queue.js";
import { PostgresLockAdapter } from "../src/adapters.js";

const queue = `test-${randomUUID()}`;

test("queue claims work once and completes it", async () => {
  const id = await enqueue(queue, { test: true });
  const first = await claim(queue, "worker-a");
  const second = await claim(queue, "worker-b");
  assert.equal(first.id, id);
  assert.equal(second, null);
  assert.equal(await complete(id, "worker-a"), true);
  const row = await query("select status from job_queue where id=$1", [id]);
  assert.equal(row.rows[0].status, "done");
});

test("queue retries then reaches dead-letter", async () => {
  const id = await enqueue(queue, { test: "retry" }, 1);
  const job = await claim(queue, "worker-retry");
  assert.equal(job.id, id);
  assert.equal(await fail(id, "worker-retry", "expected failure"), "dead");
  const row = await query("select status,last_error from job_queue where id=$1", [id]);
  assert.equal(row.rows[0].status, "dead");
  assert.equal(row.rows[0].last_error, "expected failure");
});

test("advisory lock allows only one owner", async () => {
  const locks = new PostgresLockAdapter();
  const first = await locks.withLock(`lock-${randomUUID()}`, async () => "held");
  assert.equal(first.acquired, true);
  assert.equal(first.value, "held");
});

after(async () => {
  await query("delete from job_queue where queue_name=$1", [queue]);
  await closeDb();
});