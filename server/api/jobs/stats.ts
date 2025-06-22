import { jobQueue } from '@/server/utils/jobQueue'

export default defineEventHandler(async (event) => {
  try {
    const stats = jobQueue.getStats()
    
    return {
      success: true,
      stats
    }
  } catch (error: any) {
    console.error('Error getting job stats:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get job statistics'
    })
  }
})