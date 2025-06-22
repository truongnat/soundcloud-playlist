import { jobQueue } from '@/server/utils/jobQueue'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { type, url, maxTracks } = body

  if (!type || !url) {
    throw createError({
      statusCode: 400,
      message: 'Job type and URL are required'
    })
  }

  if (type !== 'playlist') {
    throw createError({
      statusCode: 400,
      message: 'Only playlist jobs are currently supported'
    })
  }

  try {
    const job = jobQueue.createJob(type, {
      url,
      maxTracks: maxTracks || undefined
    })

    return {
      success: true,
      jobId: job.id,
      status: job.status,
      message: 'Job created successfully. Processing will begin shortly.'
    }
  } catch (error: any) {
    console.error('Error creating job:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create job: ' + error.message
    })
  }
})