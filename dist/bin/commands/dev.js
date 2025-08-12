#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const http_1 = __importDefault(require("http"));
const runDevCommand = () => {
    const nextProcess = (0, child_process_1.spawn)("next", ["dev", "-p", "3000"], {
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
    const honoProcess = (0, child_process_1.spawn)("wrangler", ["dev", "--port", "8787"], {
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
    const proxyRequest = (req, res, port) => {
        const proxyReq = http_1.default.request({
            hostname: "localhost",
            port: port,
            path: req.url,
            method: req.method,
            headers: req.headers,
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            proxyRes.pipe(res);
        });
        proxyReq.on("error", (err) => {
            console.error("Proxy error:", err);
            res.writeHead(500);
            res.end("Proxy Error");
        });
        req.pipe(proxyReq);
    };
    const server = http_1.default.createServer(async (req, res) => {
        if (req.url?.startsWith("/api")) {
            proxyRequest(req, res, 8787);
        }
        else {
            proxyRequest(req, res, 3000);
        }
    });
    server.listen(9876, () => {
        console.log("[💫Hono-Next] Development server listening on http://localhost:9876");
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
exports.default = runDevCommand;
