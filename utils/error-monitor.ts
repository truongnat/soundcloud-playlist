/**
 * Error monitoring and logging utilities for tracking connection issues
 */

export interface ErrorStats {
  totalErrors: number
  connectionErrors: number
  timeoutErrors: number
  rateLimitErrors: number
  lastError?: {
    timestamp: Date
    message: string
    type: string
  }
}

class ErrorMonitor {
  private stats: ErrorStats = {
    totalErrors: 0,
    connectionErrors: 0,
    timeoutErrors: 0,
    rateLimitErrors: 0
  }

  private errorHistory: Array<{
    timestamp: Date
    error: any
    context?: string
  }> = []

  private readonly maxHistorySize = 100

  logError(error: any, context?: string) {
    this.stats.totalErrors++
    
    // Categorize error
    if (this.isConnectionError(error)) {
      this.stats.connectionErrors++
    } else if (this.isTimeoutError(error)) {
      this.stats.timeoutErrors++
    } else if (this.isRateLimitError(error)) {
      this.stats.rateLimitErrors++
    }

    // Update last error
    this.stats.lastError = {
      timestamp: new Date(),
      message: error.message || 'Unknown error',
      type: this.getErrorType(error)
    }

    // Add to history
    this.errorHistory.push({
      timestamp: new Date(),
      error: {
        message: error.message,
        code: error.code,
        status: error.status,
        name: error.name
      },
      context
    })

    // Trim history if needed
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize)
    }

    // Log to console with context
    const errorType = this.getErrorType(error)
    console.error(`[${errorType}] ${context || 'Unknown context'}:`, {
      message: error.message,
      code: error.code,
      status: error.status,
      timestamp: new Date().toISOString()
    })
  }

  getStats(): ErrorStats {
    return { ...this.stats }
  }

  getRecentErrors(minutes: number = 5) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.errorHistory.filter(entry => entry.timestamp > cutoff)
  }

  getConnectionErrorRate(minutes: number = 5): number {
    const recentErrors = this.getRecentErrors(minutes)
    if (recentErrors.length === 0) return 0
    
    const connectionErrors = recentErrors.filter(entry => 
      this.isConnectionError(entry.error)
    ).length
    
    return connectionErrors / recentErrors.length
  }

  shouldBackoff(): boolean {
    // Back off if connection error rate is high
    const errorRate = this.getConnectionErrorRate(2) // Last 2 minutes
    return errorRate > 0.5 // More than 50% connection errors
  }

  getRecommendedDelay(): number {
    const errorRate = this.getConnectionErrorRate(5)
    
    if (errorRate > 0.8) return 5000 // Very high error rate
    if (errorRate > 0.5) return 3000 // High error rate
    if (errorRate > 0.2) return 1500 // Moderate error rate
    
    return 1000 // Normal delay
  }

  reset() {
    this.stats = {
      totalErrors: 0,
      connectionErrors: 0,
      timeoutErrors: 0,
      rateLimitErrors: 0
    }
    this.errorHistory = []
  }

  private isConnectionError(error: any): boolean {
    if (!error) return false
    
    const errorMessage = error.message?.toLowerCase() || ''
    const errorCode = error.code?.toUpperCase() || ''
    
    return (
      errorCode === 'ECONNRESET' ||
      errorCode === 'ECONNREFUSED' ||
      errorCode === 'ENOTFOUND' ||
      errorCode === 'ETIMEDOUT' ||
      errorCode === 'ECONNABORTED' ||
      error.name === 'AbortError' ||
      errorMessage.includes('econnreset') ||
      errorMessage.includes('connection reset') ||
      errorMessage.includes('socket hang up') ||
      errorMessage.includes('network error') ||
      errorMessage.includes('fetch failed')
    )
  }

  private isTimeoutError(error: any): boolean {
    return error.name === 'AbortError' || 
           error.code === 'ETIMEDOUT' ||
           error.message?.includes('timeout')
  }

  private isRateLimitError(error: any): boolean {
    return error.status === 429 || 
           error.message?.includes('rate limit') ||
           error.message?.includes('too many requests')
  }

  private getErrorType(error: any): string {
    if (this.isConnectionError(error)) return 'CONNECTION'
    if (this.isTimeoutError(error)) return 'TIMEOUT'
    if (this.isRateLimitError(error)) return 'RATE_LIMIT'
    return 'OTHER'
  }
}

// Global error monitor instance
export const errorMonitor = new ErrorMonitor()

// Helper function to log errors with context
export function logError(error: any, context?: string) {
  errorMonitor.logError(error, context)
}

// Helper function to get error statistics
export function getErrorStats() {
  return errorMonitor.getStats()
}

// Helper function to check if we should back off
export function shouldBackoff() {
  return errorMonitor.shouldBackoff()
}

// Helper function to get recommended delay
export function getRecommendedDelay() {
  return errorMonitor.getRecommendedDelay()
}