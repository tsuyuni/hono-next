#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const action = process.argv[2];
if (action === "deploy") {
    const nextConfig = require(path_1.default.resolve("./next.config.ts"));
    if (nextConfig.default.output !== "export") {
        console.error(`Error: Hono-Next only supports the "output: export" configuration in next.config.ts.`);
        process.exit(1);
    }
    (0, child_process_1.execSync)("next build", { stdio: "inherit" });
    const wranglerConfig = require(path_1.default.resolve("./wrangler.json"));
    if (wranglerConfig.assets.directory !== "out" &&
        wranglerConfig.assets.directory !== "./out") {
        console.error(`Error: Assets directory must be "out" or "./out" in next.config.ts.`);
        process.exit(1);
    }
    (0, child_process_1.execSync)("wrangler deploy", { stdio: "inherit" });
}
