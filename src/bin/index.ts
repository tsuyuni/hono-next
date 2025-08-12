#!/usr/bin/env node
import { parseArgs } from "util";
import runHelpCommnad from "./commands/help";
import runDeployCommnad from "./commands/deploy";
import runDevCommand from "./commands/dev";

const { positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
});

if (positionals.length === 0) {
  runHelpCommnad();
}

if (positionals.length > 1) {
  console.error("Error: Invalid argument provided.");
  process.exit(1);
}

const [command] = positionals;

if (command === "deploy") {
  runDeployCommnad();
}

if (command === "dev") {
  runDevCommand();
}
