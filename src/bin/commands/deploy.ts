#!/usr/bin/env node
import { spawnSync } from "child_process";
import path from "path";

const runDeployCommnad = () => {
  const nextConfig = require(path.resolve("./next.config.ts")).default;

  if (nextConfig.output !== "export") {
    console.error(
      "Error: Hono-Next only supports static exports. Please set { output: 'export' } in your next.config.ts."
    );
    process.exit(1);
  }

  spawnSync("next", ["build"], { stdio: "inherit" });

  const wranglerConfig =
    require(path.resolve("./wrangler.json")) ||
    require(path.resolve("./wrangler.jsonc"));

  if (!/^out|\.\/out$/.test(wranglerConfig.assets.directory)) {
    console.error(
      "Error: Assets directory must be set to 'out' or './out' in your wrangler.json."
    );
    process.exit(1);
  }

  spawnSync("wrangler", ["deploy"], { stdio: "inherit" });
};

export default runDeployCommnad;
