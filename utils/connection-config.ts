/**
 * Connection configuration for handling ECONNRESET and other network issues
 */

export interface ConnectionConfig {
  // Retry settings
  maxRetries: number
  baseDelay: number
  maxDelay: number
  
  // Timeout settings
  requestTimeout: number
  connectionTimeout: number
  
  // Rate limiting
  rateLimitDelay: number
  maxConcurrentRequests: number
  
  // Error handling
  retryOnConnectionReset: boolean
  retryOnTimeout: boolean
  retryOnRateLimit: boolean
  
  // Backoff strategy
  exponentialBackoff: boolean
  jitterEnabled: boolean
}

// Default configuration optimized for SoundCloud API
export const defaultConnectionConfig: ConnectionConfig = {
  // Retry settings
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  
  // Timeout settings
  requestTimeout: 15000, // 15 seconds
  connectionTimeout: 10000, // 10 seconds
  
  // Rate limiting
  rateLimitDelay: 2000,
  maxConcurrentRequests: 5,
  
  // Error handling
  retryOnConnectionReset: true,
  retryOnTimeout: true,
  retryOnRateLimit: true,
  
  // Backoff strategy
  exponentialBackoff: true,
  jitterEnabled: true
}

// Configuration for high-priority requests (streaming)
export const streamingConnectionConfig: ConnectionConfig = {
  ...defaultConnectionConfig,
  maxRetries: 4,
  baseDelay: 1500,
  requestTimeout: 20000,
  connectionTimeout: 12000
}

// Configuration for background tasks
export const backgroundConnectionConfig: ConnectionConfig = {
  ...defaultConnectionConfig,
  maxRetries: 5,
  baseDelay: 2000,
  maxDelay: 30000,
  requestTimeout: 30000,
  connectionTimeout: 20000
}

// Configuration for client ID validation (more aggressive)
export const clientIdValidationConfig: ConnectionConfig = {
  ...defaultConnectionConfig,
  maxRetries: 2,
  baseDelay: 800,
  requestTimeout: 8000,
  connectionTimeout: 6000
}

export function getConfigForContext(context: 'default' | 'streaming' | 'background' | 'validation'): ConnectionConfig {
  switch (context) {
    case 'streaming':
      return streamingConnectionConfig
    case 'background':
      return backgroundConnectionConfig
    case 'validation':
      return clientIdValidationConfig
    default:
      return defaultConnectionConfig
  }
}

export function calculateDelay(
  attempt: number, 
  config: ConnectionConfig, 
  isConnectionError: boolean = false
): number {
  let delay = config.baseDelay
  
  if (config.exponentialBackoff) {
    delay = config.baseDelay * Math.pow(2, attempt)
  }
  
  // Add extra delay for connection errors
  if (isConnectionError) {
    delay *= 1.5
  }
  
  // Add jitter to prevent thundering herd
  if (config.jitterEnabled) {
    delay += Math.random() * 1000
  }
  
  // Cap at max delay
  return Math.min(delay, config.maxDelay)
}

export function shouldRetryError(error: any, config: ConnectionConfig): boolean {
  // Connection reset errors
  if (config.retryOnConnectionReset && isConnectionResetError(error)) {
    return true
  }
  
  // Timeout errors
  if (config.retryOnTimeout && isTimeoutError(error)) {
    return true
  }
  
  // Rate limit errors
  if (config.retryOnRateLimit && isRateLimitError(error)) {
    return true
  }
  
  return false
}

function isConnectionResetError(error: any): boolean {
  if (!error) return false
  
  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code?.toUpperCase() || ''
  
  return (
    errorCode === 'ECONNRESET' ||
    errorCode === 'ECONNREFUSED' ||
    errorCode === 'ENOTFOUND' ||
    errorCode === 'ECONNABORTED' ||
    errorMessage.includes('econnreset') ||
    errorMessage.includes('connection reset') ||
    errorMessage.includes('socket hang up') ||
    errorMessage.includes('network error')
  )
}

function isTimeoutError(error: any): boolean {
  return error.name === 'AbortError' || 
         error.code === 'ETIMEDOUT' ||
         error.message?.includes('timeout')
}

function isRateLimitError(error: any): boolean {
  return error.status === 429 || 
         error.message?.includes('rate limit') ||
         error.message?.includes('too many requests')
}