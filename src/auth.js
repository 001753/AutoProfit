import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { query } from "./db.js";
const scrypt = promisify(scryptCallback);
const secret = () => process.env.SESSION_SECRET || "";
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(key).toString("hex")}`;
}
export async function verifyPassword(password, encoded) {
  const [salt, hex] = String(encoded).split(":");
  if (!salt || !hex) return false;
  const key = await scrypt(password, salt, 64);
  const expected = Buffer.from(hex, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}
function token(payload, ttl) {
  if (!secret()) throw new Error("SESSION_SECRET is required");
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now()/1000) + ttl })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}
function readToken(value) {
  const [body, sig] = String(value || "").split(".");
  if (!body || !sig || !secret()) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const data = JSON.parse(Buffer.from(body, "base64url").toString());
  return data.exp > Math.floor(Date.now()/1000) ? data : null;
}
export function readRefresh(value) { const data = readToken(value); return data?.typ === "refresh" ? data : null; }
export function issueAccess(userId, orgId, sessionId) {
  return token({ sub: userId, org: orgId, sid: sessionId, typ: "access" }, Number(process.env.JWT_ACCESS_TTL_SECONDS || 900));
}
export function issueRefresh(userId, orgId, sessionId, tokenId) {
  return token({ sub: userId, org: orgId, sid: sessionId, jti: tokenId, typ: "refresh" }, Number(process.env.JWT_REFRESH_TTL_SECONDS || 2592000));
}
export async function authenticate(req) {
  const data = readToken(req.headers.authorization?.replace(/^Bearer\s+/i, ""));
  if (!data || data.typ !== "access") return null;
  const result = await query("select u.id, u.email, m.org_id, m.role from app_user u join membership m on m.user_id=u.id join session s on s.id=$3 and s.user_id=u.id and s.org_id=m.org_id and s.revoked_at is null where u.id=$1 and m.org_id=$2 and u.deleted_at is null and m.deleted_at is null", [data.sub, data.org, data.sid]);
  return result.rows[0] ? { ...result.rows[0], sessionId: data.sid } : null;
}