# Overview

Hono-Next provides a seamless full-stack application development experience. It combines Next.js for the frontend and Hono for the backend, delivering an integrated development experience with one-command deployment to Cloudflare Workers.

# Getting Started

1. Installation

```bash
# Create Next.js app
npx create-next-app@latest

# Install Hono-Next
npm i -D hono-next
```

2. Configuration

Configure `next.config.ts` with static export output:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export";
};

export default nextConfig;
```

Create `wrangler.json`.

```json
{
  "name": "hono-next-example",
  "compatibility_date": "2025-08-11",
  "main": "src/api/index.ts",
  "assets": {
    "directory": "./out"
  }
}
```

3. Create API Routes

```ts
// src/api/index.ts
import { Hono } from "hono";

const app = new Hono();

app.get("/api", (c) => {
  return c.text("Hello, Hono!");
});

export default app;
```

4. Update `package.json`

```json
{
  "scripts": {
    "deploy": "hono-next deploy"
  }
}
```

5. Deployment

```bash
npm run deploy
```
