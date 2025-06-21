globalThis.__timing__.logStart('Load chunks/routes/api/health');import { d as defineEventHandler } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:module';
import 'node:fs';
import 'node:path';

const health = defineEventHandler(async (event) => {
  return {
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: "production",
    netlify: !!process.env.NETLIFY,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
});

export { health as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/health');
//# sourceMappingURL=health.mjs.map
