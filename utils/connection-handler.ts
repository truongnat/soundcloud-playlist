/**
 * Connection handling utilities for dealing with ECONNRESET and other network errors
 */

export interface ConnectionRetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  timeout?: number
  retryCondition?: (error: any) => boolean
}

export class ConnectionError extends Error {
  constructor(
    message: string,
    public readonly originalError: any,
    public readonly attempts: number
  ) {
    super(message)
    this.name = 'ConnectionError'
  }
}

export function isConnectionError(error: any): boolean {
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

export function isRetryableError(error: any): boolean {
  if (isConnectionError(error)) return true
  
  // HTTP status codes that are retryable
  const retryableStatuses = [408, 429, 500, 502, 503, 504]
  const status = error.status || error.response?.status
  
  return retryableStatuses.includes(status)
}

export async function withConnectionRetry<T>(
  operation: () => Promise<T>,
  options: ConnectionRetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    timeout = 15000,
    retryCondition = isRetryableError
  } = options

  let lastError: any = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), timeout)
      })
      
      // Race between operation and timeout
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ])
      
      return result
    } catch (error: any) {
      lastError = error
      
      // Log the error with context
      const errorType = isConnectionError(error) ? 'CONNECTION' : 'OTHER'
      console.error(`[${errorType}] Attempt ${attempt + 1}/${maxRetries} failed:`, {
        message: error.message,
        code: error.code,
        name: error.name,
        status: error.status
      })
      
      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === maxRetries - 1 || !retryCondition(error)) {
        break
      }
      
      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt)
      const jitter = Math.random() * 1000
      const delay = Math.min(exponentialDelay + jitter, maxDelay)
      
      // Add extra delay for connection errors
      const finalDelay = isConnectionError(error) ? delay * 1.5 : delay
      
      console.log(`Retrying in ${Math.round(finalDelay)}ms...`)
      await new Promise(resolve => setTimeout(resolve, finalDelay))
    }
  }
  
  throw new ConnectionError(
    `Operation failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    lastError,
    maxRetries
  )
}

export function createFetchWithConnectionHandling(defaultOptions: ConnectionRetryOptions = {}) {
  return async function fetchWithConnectionHandling(
    url: string,
    init: RequestInit = {},
    options: ConnectionRetryOptions = {}
  ): Promise<Response> {
    const mergedOptions = { ...defaultOptions, ...options }
    
    return withConnectionRetry(async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout || 15000)
      
      try {
        const response = await fetch(url, {
          ...init,
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Connection': 'keep-alive',
            'Accept': 'application/json, text/plain, */*',
            ...init.headers
          }
        })
        
        clearTimeout(timeoutId)
        return response
      } catch (error) {
        clearTimeout(timeoutId)
        throw error
      }
    }, mergedOptions)
  }
}

// Pre-configured fetch function for SoundCloud API calls
export const soundcloudFetch = createFetchWithConnectionHandling({
  maxRetries: 3,
  baseDelay: 1000,
  timeout: 12000
})

// Pre-configured fetch function for general API calls
export const apiFetch = createFetchWithConnectionHandling({
  maxRetries: 2,
  baseDelay: 800,
  timeout: 10000
})