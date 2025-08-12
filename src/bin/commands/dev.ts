#!/usr/bin/env node
import { spawn } from "child_process";
import http from "http";

const runDevCommand = () => {
  const nextProcess = spawn("next", ["dev", "-p", "3000"], {
    stdio: ["inherit", "pipe", "pipe"],
    env: {
      ...process.env,
      NODE_ENV: "development",
    },
  });

  nextProcess.stdout?.on("data", (data) => {
    console.log(`[▲ Next.js] ${data.toString().trim()}`);
  });

  nextProcess.stderr?.on("data", (data) => {
    console.error(`[▲ Next.js] ${data.toString().trim()}`);
  });

  nextProcess.on("error", (error) => {
    console.error(`[▲ Next.js] ${error.message}`);
  });

  const honoProcess = spawn("wrangler", ["dev", "--port", "8787"], {
    stdio: ["inherit", "pipe", "pipe"],
  });

  honoProcess.stdout?.on("data", (data) => {
    console.log(`[☁️ Wrangler] ${data.toString().trim()}`);
  });

  honoProcess.stderr?.on("data", (data) => {
    console.error(`[☁️ Wrangler] ${data.toString().trim()}`);
  });

  honoProcess.on("error", (error) => {
    console.error(`[☁️ Wrangler] ${error.message}`);
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
    console.log(
      "[💫Hono-Next] Development server listening on http://localhost:9876"
    );
  });

  process.on("SIGINT", () => {
    console.log("\nShutting down servers...");
    server.close(() => {
      console.log("Proxy server stopped");
    });
    nextProcess.kill("SIGINT");
    honoProcess.kill("SIGINT");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\nReceived SIGTERM, shutting down servers...");
    server.close(() => {
      console.log("Proxy server stopped");
    });
    nextProcess.kill("SIGTERM");
    honoProcess.kill("SIGTERM");
    process.exit(0);
  });
};

export default runDevCommand;
