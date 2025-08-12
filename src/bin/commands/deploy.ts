#!/usr/bin/env node
import { spawnSync } from "child_process";
import path from "path";

const runDeployCommnad = () => {
  const nextConfig = require(path.resolve("./next.config.ts")).default;

  if (nextConfig.output !== "export") {
    console.error(
      `Error: Hono-Next only supports the "output: export" configuration in next.config.ts.`
    );
    process.exit(1);
  }

  spawnSync("next", ["build"], { stdio: "inherit" });

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

  spawnSync("wrangler", ["deploy"], { stdio: "inherit" });
};

export default runDeployCommnad;
