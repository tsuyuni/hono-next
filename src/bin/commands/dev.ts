#!/usr/bin/env node
import { spawn } from "child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import { Hono } from "hono";
import http from "http";
import path from "path";

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

  if (!existsSync(path.resolve(".hono-next"))) {
    mkdirSync(path.resolve(".hono-next"));
  }
  writeFileSync(path.resolve(".hono-next", "index.ts"), "HOGEGE");

  const readdirRec = (p: string): string[] => {
    const dirents = readdirSync(p, {
      withFileTypes: true,
    });

    const files = [];

    for (const d of dirents) {
      if (d.isFile()) {
        files.push(path.resolve(d.parentPath, d.name));
      }

      if (d.isDirectory()) {
        files.push(...readdirRec(path.resolve(p, d.name)));
      }
    }

    return files;
  };

  const files = readdirRec(path.resolve("src", "api"));

  for (const file of files) {
    const filePath = path.relative(path.resolve(), file);
    const pattern = filePath.match(
      /^src\/api(?<targetPath>(?<targetDir>(?:\/.+)*)\/index\.(?:ts|tsx))$/
    );
    const targetDir = pattern?.groups?.targetDir;
    const targetPath = pattern?.groups?.targetPath;

    const { GET, POST } = require(file);

    if (!targetDir) {
      const sourceFiles = files
        .map((f) =>
          path
            .relative(path.resolve(), f)
            .replace(/^src\/api(\/.+)+\/index\.(?:ts|tsx)$/, "$1")
        )
        .filter((f) => {
          return f !== "src/api" + targetPath;
        });

      writeFileSync(
        path.resolve(".hono-next", ...targetPath!.split("/")),
        `import { Hono } from "hono";
${sourceFiles
  .map((f) => `import ${f.split("/").join("")} from ".${f}"`)
  .join("\n")}

const app = new Hono().basePath("/api");

app${GET ? `.get("/", ${GET})` : ""}${POST ? `.post("/", ${POST})` : ""};

${sourceFiles
  .map(
    (f) => `app.route("/${f.split("/").join("")}", ${f.split("/").join("")});`
  )
  .join("\n")}

export default app;
`
      );
    } else {
      mkdirSync(path.resolve(".hono-next", ...targetDir.split("/")), {
        recursive: true,
      });

      writeFileSync(
        path.resolve(".hono-next", ...targetPath!.split("/")),
        `import { Hono } from "hono";

const app = new Hono();

app${GET ? `.get("/", ${GET})` : ""}${POST ? `.post("/", ${POST})` : ""};

export default app;
`
      );
    }
  }

  const honoProcess = spawn(
    "wrangler",
    [
      "dev",
      "index.ts",
      "--port",
      "8787",
      "--cwd",
      ".hono-next",
      "--assets",
      "",
    ],
    {
      stdio: ["inherit", "pipe", "pipe"],
    }
  );

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
