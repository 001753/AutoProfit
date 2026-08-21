import { randomUUID } from "node:crypto";
import { query } from "./db.js";

export class MemoryCacheAdapter {
  #values = new Map();
  get(key) { return this.#values.get(key) ?? null; }
  set(key, value, ttlMs = 300000) {
    this.#values.set(key, value);
    setTimeout(() => this.#values.delete(key), ttlMs).unref?.();
  }
  delete(key) { this.#values.delete(key); }
}

export class LogicalStorageAdapter {
  key(tenantId, namespace, id = randomUUID()) {
    if (!tenantId) throw new Error("tenant_id_required");
    return `${tenantId}/${namespace}/${id}`;
  }
}

export class SseRealtimeAdapter {
  constructor() { this.clients = new Map(); }
  subscribe(topic, res) {
    const set = this.clients.get(topic) || new Set();
    set.add(res); this.clients.set(topic, set);
    return () => set.delete(res);
  }
  publish(topic, event, data) {
    for (const res of this.clients.get(topic) || []) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
  }
}

export class PostgresLockAdapter {
  async withLock(key, fn) {
    const result = await query("select pg_try_advisory_lock(hashtext($1)) as locked", [key]);
    if (!result.rows[0].locked) return { acquired: false };
    try { return { acquired: true, value: await fn() }; }
    finally { await query("select pg_advisory_unlock(hashtext($1))", [key]); }
  }
}

export class InAppNotificationChannel {
  async send(tenantId, payload) {
    if (!tenantId) throw new Error("tenant_id_required");
    return { channel: "in_app", tenantId, payload };
  }
}