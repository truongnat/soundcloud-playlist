import type { PlaylistResponse } from '@/types'

export interface JobStatus {
  id: string
  type: 'playlist' | 'track'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  createdAt: string
  updatedAt: string
  completedAt?: string
  error?: string
  result?: PlaylistResponse
}

export interface JobStats {
  total: number
  pending: number
  processing: number
  completed: number
  failed: number
  processingCapacity: number
  currentlyProcessing: number
}

export const useBackgroundJobs = () => {
  const activeJobs = ref<Map<string, JobStatus>>(new Map())
  const pollingIntervals = ref<Map<string, NodeJS.Timeout>>(new Map())

  // Create a background job
  const createJob = async (type: 'playlist', url: string, maxTracks?: number) => {
    try {
      const response = await $fetch<{
        success: boolean
        jobId: string
        status: string
        message: string
        checkStatusUrl: string
      }>('/api/jobs/create', {
        method: 'POST',
        body: {
          type,
          url,
          maxTracks
        }
      })

      if (response.success) {
        // Start polling for this job
        startPolling(response.jobId)
        return response
      } else {
        throw new Error('Failed to create job')
      }
    } catch (error: any) {
      console.error('Error creating background job:', error)
      throw error
    }
  }

  // Get job status
  const getJobStatus = async (jobId: string): Promise<JobStatus> => {
    try {
      const status = await $fetch<JobStatus>(`/api/jobs/status/${jobId}`)
      
      // Update local cache
      activeJobs.value.set(jobId, status)
      
      return status
    } catch (error: any) {
      console.error('Error getting job status:', error)
      throw error
    }
  }

  // Start polling for job updates
  const startPolling = (jobId: string, intervalMs = 2000) => {
    // Clear existing interval if any
    stopPolling(jobId)

    const interval = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId)
        
        // Stop polling if job is completed or failed
        if (status.status === 'completed' || status.status === 'failed') {
          stopPolling(jobId)
        }
      } catch (error) {
        console.error('Error polling job status:', error)
        // Continue polling even on error, but maybe with longer interval
      }
    }, intervalMs)

    pollingIntervals.value.set(jobId, interval)
  }

  // Stop polling for a specific job
  const stopPolling = (jobId: string) => {
    const interval = pollingIntervals.value.get(jobId)
    if (interval) {
      clearInterval(interval)
      pollingIntervals.value.delete(jobId)
    }
  }

  // Stop all polling
  const stopAllPolling = () => {
    pollingIntervals.value.forEach((interval) => {
      clearInterval(interval)
    })
    pollingIntervals.value.clear()
  }

  // Get job statistics
  const getJobStats = async (): Promise<JobStats> => {
    try {
      const response = await $fetch<{ success: boolean; stats: JobStats }>('/api/jobs/stats')
      return response.stats
    } catch (error: any) {
      console.error('Error getting job stats:', error)
      throw error
    }
  }

  // Process playlist with background job
  const processPlaylistBackground = async (url: string, maxTracks?: number) => {
    const jobResponse = await createJob('playlist', url, maxTracks)
    
    return {
      jobId: jobResponse.jobId,
      // Return a promise that resolves when the job completes
      result: new Promise<PlaylistResponse>((resolve, reject) => {
        const checkStatus = async () => {
          try {
            const status = await getJobStatus(jobResponse.jobId)
            
            if (status.status === 'completed' && status.result) {
              resolve(status.result)
            } else if (status.status === 'failed') {
              reject(new Error(status.error || 'Job failed'))
            } else {
              // Continue checking
              setTimeout(checkStatus, 2000)
            }
          } catch (error) {
            reject(error)
          }
        }
        
        checkStatus()
      })
    }
  }

  // Cleanup when component unmounts
  onUnmounted(() => {
    stopAllPolling()
  })

  return {
    activeJobs: readonly(activeJobs),
    createJob,
    getJobStatus,
    startPolling,
    stopPolling,
    stopAllPolling,
    getJobStats,
    processPlaylistBackground
  }
}