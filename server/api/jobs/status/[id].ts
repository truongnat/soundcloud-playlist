import { jobQueue } from '@/server/utils/jobQueue'

export default defineEventHandler(async (event) => {
  const jobId = getRouterParam(event, 'id')

  if (!jobId) {
    throw createError({
      statusCode: 400,
      message: 'Job ID is required'
    })
  }

  const job = jobQueue.getJob(jobId)

  if (!job) {
    throw createError({
      statusCode: 404,
      message: 'Job not found'
    })
  }

  // Return job status without sensitive internal data
  return {
    id: job.id,
    type: job.type,
    status: job.status,
    progress: job.progress,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt,
    error: job.error,
    // Only include result if job is completed
    result: job.status === 'completed' ? job.result : undefined
  }
})