/**
 * Common API utilities and error handling
 */

export interface ApiError {
  statusCode: number
  message: string
}

export function createApiError(statusCode: number, message: string): ApiError {
  return { statusCode, message }
}

export function handleApiError(error: any, defaultMessage = 'Unknown error'): ApiError {
  if (error?.statusCode) {
    return error
  }
  
  const statusCode = error?.status || error?.response?.status || 500
  const message = error?.message || defaultMessage
  
  return createApiError(statusCode, message)
}

export async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  maxRetries = 3,
  baseDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null
  
  // Add timeout and connection handling to options
  const enhancedOptions: RequestInit = {
    ...options,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Connection': 'keep-alive',
      'Accept': 'application/json, text/plain, */*',
      ...options.headers
    }
  }

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
  enhancedOptions.signal = controller.signal
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, enhancedOptions)
      clearTimeout(timeoutId)
      
      if (response.status === 429) {
        // Rate limited, wait longer
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
        console.log(`Rate limited, waiting ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      return response
    } catch (error: any) {
      clearTimeout(timeoutId)
      lastError = error
      
      // Log specific error types for better debugging
      if (error.name === 'AbortError') {
        console.error(`Fetch attempt ${attempt + 1}/${maxRetries} timed out after 15s`)
      } else if (error.code === 'ECONNRESET' || error.message?.includes('ECONNRESET')) {
        console.error(`Fetch attempt ${attempt + 1}/${maxRetries} connection reset:`, error.message)
      } else if (error.code === 'ENOTFOUND' || error.message?.includes('ENOTFOUND')) {
        console.error(`Fetch attempt ${attempt + 1}/${maxRetries} DNS resolution failed:`, error.message)
      } else {
        console.error(`Fetch attempt ${attempt + 1}/${maxRetries} failed:`, error.message)
      }
      
      if (attempt === maxRetries - 1) {
        break
      }
      
      // Longer delay for connection resets
      const isConnectionError = error.code === 'ECONNRESET' || 
                               error.message?.includes('ECONNRESET') ||
                               error.name === 'AbortError'
      const delay = isConnectionError 
        ? baseDelay * Math.pow(2, attempt + 1) + Math.random() * 2000 // Longer delay for connection issues
        : baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      
      console.log(`Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Create new abort controller for next attempt
      const newController = new AbortController()
      const newTimeoutId = setTimeout(() => newController.abort(), 15000)
      enhancedOptions.signal = newController.signal
    }
  }
  
  throw lastError || new Error('Max retries exceeded')
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"/\\|?*]/g, '_')
}