#!/usr/bin/env node
const runHelpCommnad = () => {
  console.log(`hono-next <command>
    
hono-next deploy  deploy project to Cloudflare Workers
hono-next dev     start the development server
hono-next help    list all usable commands
`);
};

export default runHelpCommnad;
