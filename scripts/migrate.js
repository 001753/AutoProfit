import { readFile } from "node:fs/promises";
import { query, closeDb } from "../src/db.js";
const sql = await readFile(new URL("../sql/001_identity.sql", import.meta.url), "utf8");
await query(sql);
console.log("migration 001_identity applied");
await closeDb();