#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const runDeployCommnad = () => {
    const nextConfig = require(path_1.default.resolve("./next.config.ts")).default;
    if (nextConfig.output !== "export") {
        console.error(`Error: Hono-Next only supports the "output: export" configuration in next.config.ts.`);
        process.exit(1);
    }
    (0, child_process_1.spawnSync)("next", ["build"], { stdio: "inherit" });
    const wranglerConfig = require(path_1.default.resolve("./wrangler.json"));
    if (wranglerConfig.assets.directory !== "out" &&
        wranglerConfig.assets.directory !== "./out") {
        console.error(`Error: Assets directory must be "out" or "./out" in next.config.ts.`);
        process.exit(1);
    }
    (0, child_process_1.spawnSync)("wrangler", ["deploy"], { stdio: "inherit" });
};
exports.default = runDeployCommnad;
