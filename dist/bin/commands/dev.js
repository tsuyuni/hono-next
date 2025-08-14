#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
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
    if (!(0, fs_1.existsSync)(path_1.default.resolve(".hono-next"))) {
        (0, fs_1.mkdirSync)(path_1.default.resolve(".hono-next"));
    }
    (0, fs_1.writeFileSync)(path_1.default.resolve(".hono-next", "index.ts"), "HOGEGE");
    const readdirRec = (p) => {
        const dirents = (0, fs_1.readdirSync)(p, {
            withFileTypes: true,
        });
        const files = [];
        for (const d of dirents) {
            if (d.isFile()) {
                files.push(path_1.default.resolve(d.parentPath, d.name));
            }
            if (d.isDirectory()) {
                files.push(...readdirRec(path_1.default.resolve(p, d.name)));
            }
        }
        return files;
    };
    const files = readdirRec(path_1.default.resolve("src", "api"));
    for (const file of files) {
        const filePath = path_1.default.relative(path_1.default.resolve(), file);
        const pattern = filePath.match(/^src\/api(?<targetPath>(?<targetDir>(?:\/.+)*)\/index\.(?:ts|tsx))$/);
        const targetDir = pattern?.groups?.targetDir;
        const targetPath = pattern?.groups?.targetPath;
        const { GET, POST } = require(file);
        if (!targetDir) {
            const sourceFiles = files
                .map((f) => path_1.default
                .relative(path_1.default.resolve(), f)
                .replace(/^src\/api(\/.+)+\/index\.(?:ts|tsx)$/, "$1"))
                .filter((f) => {
                return f !== "src/api" + targetPath;
            });
            (0, fs_1.writeFileSync)(path_1.default.resolve(".hono-next", ...targetPath.split("/")), `import { Hono } from "hono";
${sourceFiles
                .map((f) => `import ${f.split("/").join("")} from ".${f}"`)
                .join("\n")}

const app = new Hono().basePath("/api");

app${GET ? `.get("/", ${GET})` : ""}${POST ? `.post("/", ${POST})` : ""};

${sourceFiles
                .map((f) => `app.route("/${f.split("/").join("")}", ${f.split("/").join("")});`)
                .join("\n")}

export default app;
`);
        }
        else {
            (0, fs_1.mkdirSync)(path_1.default.resolve(".hono-next", ...targetDir.split("/")), {
                recursive: true,
            });
            (0, fs_1.writeFileSync)(path_1.default.resolve(".hono-next", ...targetPath.split("/")), `import { Hono } from "hono";

const app = new Hono();

app${GET ? `.get("/", ${GET})` : ""}${POST ? `.post("/", ${POST})` : ""};

export default app;
`);
        }
    }
    const honoProcess = (0, child_process_1.spawn)("wrangler", [
        "dev",
        "index.ts",
        "--port",
        "8787",
        "--cwd",
        ".hono-next",
        "--assets",
        "",
    ], {
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
