#!/usr/bin/env node
import path from "path";
import { execSync } from "child_process";

const action = process.argv[2];

if (action === "deploy") {
  const nextConfig = require(path.resolve("./next.config.ts"));

  if (nextConfig.default.output !== "export") {
    console.error(
      `Error: Hono-Next only supports the "output: export" configuration in next.config.ts.`
    );
    process.exit(1);
  }

  execSync("next build", { stdio: "inherit" });

  const wranglerConfig = require(path.resolve("./wrangler.json"));

  if (
    wranglerConfig.assets.directory !== "out" &&
    wranglerConfig.assets.directory !== "./out"
  ) {
    console.error(
      `Error: Assets directory must be "out" or "./out" in next.config.ts.`
    );
    process.exit(1);
  }

  execSync("wrangler deploy", { stdio: "inherit" });
}
