#!/usr/bin/env node
import { serve } from "@hono/node-server";
import { spawn } from "child_process";
import path from "path";
import http from "http";

const runDevCommand = () => {
  const app = require(path.resolve("./src/api/index.ts")).default;

  const honoServer = serve({
    fetch: app.fetch,
    port: 8787,
  });

  const nextProcess = spawn("next", ["dev", "-p", "3000"], {
    stdio: ["inherit", "pipe", "inherit"],
    env: {
      ...process.env,
      NODE_ENV: "development",
    },
  });

  const proxyRequest = (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    port: number
  ) => {
    const proxyReq = http.request(
      {
        hostname: "localhost",
        port: port,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on("error", (err) => {
      console.error("Proxy error:", err);
      res.writeHead(500);
      res.end("Proxy Error");
    });

    req.pipe(proxyReq);
  };

  const server = http.createServer(async (req, res) => {
    if (req.url?.startsWith("/api")) {
      proxyRequest(req, res, 8787);
    } else {
      proxyRequest(req, res, 3000);
    }
  });

  server.listen(9876, () => {
    console.log("🔥 Development server listening on http://localhost:9876");
  });

  process.on("SIGINT", () => {
    console.log("\nShutting down servers...");
    server.close(() => {
      console.log("Proxy server stopped");
    });
    nextProcess.kill("SIGINT");
    honoServer.close();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\nReceived SIGTERM, shutting down servers...");
    server.close(() => {
      console.log("Proxy server stopped");
    });
    nextProcess.kill("SIGTERM");
    honoServer.close();
    process.exit(0);
  });
};

export default runDevCommand;
