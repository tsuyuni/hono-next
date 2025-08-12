#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runHelpCommnad = () => {
    console.log(`hono-next <command>
    
hono-next deploy  deploy project to Cloudflare Workers
hono-next dev     start the development server
hono-next help    list all usable commands
`);
};
exports.default = runHelpCommnad;
