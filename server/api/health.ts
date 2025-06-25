import { getErrorStats, shouldBackoff } from '~/utils/error-monitor'

export default defineEventHandler(async (event) => {
  const errorStats = getErrorStats()
  const backoffRecommended = shouldBackoff()
  
  return {
    status: backoffRecommended ? 'degraded' : 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    netlify: !!process.env.NETLIFY,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    errors: {
      total: errorStats.totalErrors,
      connection: errorStats.connectionErrors,
      timeout: errorStats.timeoutErrors,
      rateLimit: errorStats.rateLimitErrors,
      lastError: errorStats.lastError
    },
    recommendations: {
      backoffRecommended,
      message: backoffRecommended 
        ? 'High connection error rate detected. Consider reducing request frequency.'
        : 'System operating normally.'
    }
  }
})