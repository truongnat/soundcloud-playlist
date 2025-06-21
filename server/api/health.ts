export default defineEventHandler(async (event) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    netlify: !!process.env.NETLIFY,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  }
})