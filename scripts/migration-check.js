import { query, closeDb } from "../src/db.js";
const result = await query("select to_regclass('public.organization') as organization, to_regclass('public.app_user') as app_user");
if (!result.rows[0].organization || !result.rows[0].app_user) throw new Error("identity migration is pending");
console.log("migration check passed");
await closeDb();