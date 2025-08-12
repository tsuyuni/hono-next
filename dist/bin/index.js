#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const help_1 = __importDefault(require("./commands/help"));
const deploy_1 = __importDefault(require("./commands/deploy"));
const dev_1 = __importDefault(require("./commands/dev"));
const { positionals } = (0, util_1.parseArgs)({
    args: process.argv.slice(2),
    allowPositionals: true,
});
if (positionals.length === 0) {
    (0, help_1.default)();
}
if (positionals.length > 1) {
    console.error("Error: Invalid argument provided.");
    process.exit(1);
}
const [command] = positionals;
if (command === "deploy") {
    (0, deploy_1.default)();
}
if (command === "dev") {
    (0, dev_1.default)();
}
