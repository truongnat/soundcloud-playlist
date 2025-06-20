import { getClientId } from '@/server/utils/soundcloud'

export default defineEventHandler(async (event) => {
  try {
    console.log('Testing client ID retrieval...')
    const clientId = await getClientId()
    
    // Test the client ID by making a simple API call
    const testUrl = `https://api-v2.soundcloud.com/tracks/1234567890?client_id=${clientId}`
    const response = await fetch(testUrl)
    
    return {
      success: true,
      clientId: clientId,
      testStatus: response.status,
      isValid: response.status !== 401 && response.status !== 403,
      message: `Client ID is ${response.status !== 401 && response.status !== 403 ? 'valid' : 'invalid'}`
    }
  } catch (error: any) {
    console.error('Client ID test failed:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to get or validate client ID'
    }
  }
})