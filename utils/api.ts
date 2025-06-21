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
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      
      if (response.status === 429) {
        // Rate limited, wait longer
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
        console.log(`Rate limited, waiting ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      return response
    } catch (error: any) {
      lastError = error
      console.error(`Fetch attempt ${attempt + 1}/${maxRetries} failed:`, error.message)
      
      if (attempt === maxRetries - 1) {
        break
      }
      
      // Wait before retry with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      console.log(`Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
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