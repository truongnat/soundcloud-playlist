import type { ProcessedTrack, PlaylistResponse } from '@/types'

export interface Job {
  id: string
  type: 'playlist' | 'track'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  data: any
  result?: any
  error?: string
  progress: number
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface PlaylistJob extends Job {
  type: 'playlist'
  data: {
    url: string
    maxTracks?: number
  }
  result?: PlaylistResponse
}

// In-memory job storage (can be replaced with Redis for production)
class JobQueue {
  private jobs: Map<string, Job> = new Map()
  private processing: Set<string> = new Set()
  private maxConcurrentJobs = 3

  generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  createJob(type: Job['type'], data: any): Job {
    const job: Job = {
      id: this.generateJobId(),
      type,
      status: 'pending',
      data,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.jobs.set(job.id, job)
    console.log(`Created job ${job.id} of type ${type}`)
    
    // Start processing if we have capacity
    this.processNext()
    
    return job
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id)
  }

  updateJob(id: string, updates: Partial<Job>): Job | undefined {
    const job = this.jobs.get(id)
    if (!job) return undefined

    Object.assign(job, updates, { updatedAt: new Date() })
    this.jobs.set(id, job)
    return job
  }

  completeJob(id: string, result: any): Job | undefined {
    const job = this.jobs.get(id)
    if (!job) return undefined

    job.status = 'completed'
    job.result = result
    job.progress = 100
    job.completedAt = new Date()
    job.updatedAt = new Date()
    
    this.jobs.set(id, job)
    this.processing.delete(id)
    
    console.log(`Completed job ${id}`)
    
    // Process next job in queue
    this.processNext()
    
    return job
  }

  failJob(id: string, error: string): Job | undefined {
    const job = this.jobs.get(id)
    if (!job) return undefined

    job.status = 'failed'
    job.error = error
    job.updatedAt = new Date()
    
    this.jobs.set(id, job)
    this.processing.delete(id)
    
    console.log(`Failed job ${id}: ${error}`)
    
    // Process next job in queue
    this.processNext()
    
    return job
  }

  private async processNext() {
    if (this.processing.size >= this.maxConcurrentJobs) {
      return // Already at max capacity
    }

    // Find next pending job
    const pendingJob = Array.from(this.jobs.values())
      .find(job => job.status === 'pending')

    if (!pendingJob) {
      return // No pending jobs
    }

    this.processing.add(pendingJob.id)
    pendingJob.status = 'processing'
    pendingJob.updatedAt = new Date()
    
    console.log(`Starting to process job ${pendingJob.id}`)

    try {
      if (pendingJob.type === 'playlist') {
        await this.processPlaylistJob(pendingJob as PlaylistJob)
      }
    } catch (error: any) {
      this.failJob(pendingJob.id, error.message || 'Unknown error')
    }
  }

  private async processPlaylistJob(job: PlaylistJob) {
    try {
      // Import the playlist processing function
      const { processPlaylistBackground } = await import('./playlistProcessor')
      
      // Process with progress updates
      const result = await processPlaylistBackground(
        job.data.url,
        job.data.maxTracks,
        (progress: number) => {
          this.updateJob(job.id, { progress })
        }
      )

      this.completeJob(job.id, result)
    } catch (error: any) {
      this.failJob(job.id, error.message || 'Failed to process playlist')
    }
  }

  // Get all jobs (for admin/debugging)
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  // Clean up old completed jobs (older than 1 hour)
  cleanup() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'completed' && job.completedAt && job.completedAt < oneHourAgo) {
        this.jobs.delete(id)
        console.log(`Cleaned up old job ${id}`)
      }
    }
  }

  // Get queue statistics
  getStats() {
    const jobs = Array.from(this.jobs.values())
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      processingCapacity: this.maxConcurrentJobs,
      currentlyProcessing: this.processing.size
    }
  }
}

// Singleton instance
export const jobQueue = new JobQueue()

// Cleanup old jobs every 30 minutes
setInterval(() => {
  jobQueue.cleanup()
}, 30 * 60 * 1000)