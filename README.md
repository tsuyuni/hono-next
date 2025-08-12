# Overview

Hono-Next provides a seamless full-stack application development experience. It combines Next.js for the frontend and Hono for the backend, delivering an integrated development experience with one-command deployment to Cloudflare Workers.

# Getting Started

1. Installation

```bash
# Create Next.js app
npx create-next-app@latest

# Install Hono-Next
npm i -D hono-next

# Install Hono
npm i hono
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

3. Update `package.json`

```json
{
  "scripts": {
    "dev": "hono-next dev",
    "deploy": "hono-next deploy"
  }
}
```

4. Create API Routes

```ts
// src/api/index.ts
import { Hono } from "hono";

const app = new Hono().basePath("/api");

app.get("/", (c) => {
  return c.text("Hello, Hono!");
});

export default app;
```

5. Development

```bash
npm run dev
```

6. Deployment

```bash
npm run deploy
```
