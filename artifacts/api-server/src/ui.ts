import fs from "node:fs/promises";
import path from "node:path";
import type { FastifyInstance } from "fastify";

const webRoot = path.join(process.cwd(), "web");

async function readWebAsset(fileName: string): Promise<string> {
  return fs.readFile(path.join(webRoot, fileName), "utf8");
}

export function registerDesignSystemRoutes(app: FastifyInstance, basePath = ""): void {
  app.get(`${basePath}/`, async (_request, reply) => {
    return reply.type("text/html; charset=utf-8").send(await readWebAsset("index.html"));
  });

  app.get(`${basePath}/styles.css`, async (_request, reply) => {
    return reply.type("text/css; charset=utf-8").send(await readWebAsset("styles.css"));
  });

  app.get(`${basePath}/app.js`, async (_request, reply) => {
    return reply.type("application/javascript; charset=utf-8").send(await readWebAsset("app.js"));
  });
}