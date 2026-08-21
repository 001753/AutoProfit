import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { dbHealth, query, closeDb } from "./db.js";
import { authenticate, hashPassword, verifyPassword, issueAccess, issueRefresh, readRefresh } from "./auth.js";
import { SseRealtimeAdapter } from "./adapters.js";
import { enqueue } from "./queue.js";
const port = Number(process.env.PORT || 5000);
let lastPoll = Date.now();
const realtime = new SseRealtimeAdapter();
const log = (event, fields = {}) => console.log(JSON.stringify({ event, ...fields }));
const json = (res, status, data, requestId) => { res.writeHead(status, {"content-type":"application/json","x-request-id":requestId}); res.end(JSON.stringify(data)); };
async function body(req) { let raw=""; for await (const chunk of req) raw += chunk; return raw ? JSON.parse(raw) : {}; }
async function handler(req, res) {
  const requestId = req.headers["x-request-id"] || randomUUID();
  try {
    if (req.method === "GET" && req.url === "/favicon.ico") {
      res.writeHead(204, {"x-request-id": requestId});
      return res.end();
    }
    if (req.method === "GET" && req.url === "/health") {
      const db = await dbHealth(), poller = Date.now() - lastPoll < 120000;
      return json(res, db && poller ? 200 : 503, { status: db && poller ? "ok" : "degraded", database: db, scheduler: poller }, requestId);
    }
    if (req.method === "GET" && req.url === "/api/events") {
      const user = await authenticate(req);
      if (!user) return json(res, 401, {error:"unauthorized"}, requestId);
      res.writeHead(200, {"content-type":"text/event-stream","cache-control":"no-cache","connection":"keep-alive","x-request-id":requestId});
      res.write("event: ready\ndata: {}\n\n");
      const unsubscribe = realtime.subscribe(`org:${user.org_id}`, res);
      req.on("close", unsubscribe);
      return;
    }
    if (req.method === "POST" && req.url === "/api/jobs") {
      const user = await authenticate(req);
      if (!user) return json(res, 401, {error:"unauthorized"}, requestId);
      const input = await body(req);
      const id = await enqueue(input.queueName || "default", { orgId: user.org_id, ...input.payload });
      log("job_enqueued", {requestId, jobId:id, orgId:user.org_id});
      realtime.publish(`org:${user.org_id}`, "job_queued", {id});
      return json(res, 202, {id}, requestId);
    }
    if (req.method === "POST" && req.url === "/api/auth/signup") {
      const input = await body(req);
      if (!input.email || !input.password || input.password.length < 12 || !input.organizationName) return json(res, 400, {error:"invalid_input"}, requestId);
      const client = await (await import("./db.js")).pool.connect();
      try {
        await client.query("begin");
        const org = await client.query("insert into organization(name) values($1) returning id", [input.organizationName]);
        const user = await client.query("insert into app_user(email,password_hash) values(lower($1),$2) returning id,email", [input.email, await hashPassword(input.password)]);
        await client.query("insert into membership(user_id,org_id,role) values($1,$2,'Owner')", [user.rows[0].id, org.rows[0].id]);
        const session = await client.query("insert into session(user_id,org_id,refresh_token_id) values($1,$2,gen_random_uuid()) returning id,refresh_token_id", [user.rows[0].id, org.rows[0].id]);
        await client.query("insert into audit_log(org_id,actor_user_id,action,entity_type,entity_id,source) values($1,$2,'signup','organization',$1,'api')", [org.rows[0].id,user.rows[0].id]);
        await client.query("commit");
        return json(res, 201, {user:user.rows[0], organizationId:org.rows[0].id, accessToken:issueAccess(user.rows[0].id,org.rows[0].id,session.rows[0].id), refreshToken:issueRefresh(user.rows[0].id,org.rows[0].id,session.rows[0].id,session.rows[0].refresh_token_id)}, requestId);
      } catch (e) { await client.query("rollback"); if (e.code === "23505") return json(res, 409, {error:"account_exists"}, requestId); throw e; } finally { client.release(); }
    }
    if (req.method === "POST" && req.url === "/api/auth/login") {
      const input=await body(req), found=await query("select u.id,u.email,u.password_hash,m.org_id,m.role from app_user u join membership m on m.user_id=u.id where u.email=lower($1) and u.deleted_at is null and m.deleted_at is null",[input.email||""]);
      if (!found.rows[0] || !(await verifyPassword(input.password||"",found.rows[0].password_hash))) return json(res,401,{error:"invalid_credentials"},requestId);
      const s=await query("insert into session(user_id,org_id,refresh_token_id) values($1,$2,gen_random_uuid()) returning id,refresh_token_id",[found.rows[0].id,found.rows[0].org_id]);
      return json(res,200,{user:{id:found.rows[0].id,email:found.rows[0].email,role:found.rows[0].role,orgId:found.rows[0].org_id},accessToken:issueAccess(found.rows[0].id,found.rows[0].org_id,s.rows[0].id),refreshToken:issueRefresh(found.rows[0].id,found.rows[0].org_id,s.rows[0].id,s.rows[0].refresh_token_id)},requestId);
    }
    if (req.method === "POST" && req.url === "/api/auth/refresh") {
      const input = await body(req), claims = readRefresh(input.refreshToken);
      if (!claims) return json(res, 401, {error:"invalid_refresh_token"}, requestId);
      const current = await query("select id,refresh_token_id from session where id=$1 and user_id=$2 and org_id=$3 and revoked_at is null", [claims.sid, claims.sub, claims.org]);
      if (!current.rows[0] || current.rows[0].refresh_token_id.toString() !== claims.jti) {
        await query("update session set revoked_at=now() where user_id=$1 and org_id=$2 and revoked_at is null", [claims.sub, claims.org]);
        return json(res, 401, {error:"refresh_reuse_detected"}, requestId);
      }
      const next = await query("update session set revoked_at=now() where id=$1 returning id", [claims.sid]);
      if (!next.rows[0]) return json(res, 401, {error:"session_revoked"}, requestId);
      const created = await query("insert into session(user_id,org_id,refresh_token_id) values($1,$2,gen_random_uuid()) returning id,refresh_token_id", [claims.sub, claims.org]);
      return json(res, 200, {accessToken:issueAccess(claims.sub,claims.org,created.rows[0].id),refreshToken:issueRefresh(claims.sub,claims.org,created.rows[0].id,created.rows[0].refresh_token_id)}, requestId);
    }
    if (req.method === "POST" && req.url === "/api/auth/logout") {
      const user = await authenticate(req);
      if (!user) return json(res, 401, {error:"unauthorized"}, requestId);
      await query("update session set revoked_at=now() where id=$1 and user_id=$2 and org_id=$3", [user.sessionId,user.id,user.org_id]);
      return json(res, 200, {loggedOut:true}, requestId);
    }
    if (req.method === "GET" && req.url === "/api/me") { const user=await authenticate(req); return user ? json(res,200,{user},requestId) : json(res,401,{error:"unauthorized"},requestId); }
    return json(res,404,{error:"not_found"},requestId);
  } catch (error) { log("request_error", {requestId, error:error.message}); return json(res,500,{error:"internal_error",requestId},requestId); }
}
const server=createServer(handler);
server.listen(port, "0.0.0.0", () => console.log(JSON.stringify({event:"server_started",port})));
const timer=setInterval(()=>{lastPoll=Date.now()},30000);
const shutdown=async()=>{clearInterval(timer);server.close();await closeDb();};
process.on("SIGTERM",shutdown); process.on("SIGINT",shutdown);