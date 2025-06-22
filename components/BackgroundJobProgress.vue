<template>
  <div v-if="job" class="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-8">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg 
            v-if="job.status === 'processing'" 
            class="w-6 h-6 text-blue-500 animate-spin" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg 
            v-else-if="job.status === 'completed'" 
            class="w-6 h-6 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg 
            v-else-if="job.status === 'failed'" 
            class="w-6 h-6 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg 
            v-else 
            class="w-6 h-6 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold text-gray-100">
            {{ getStatusText() }}
          </h3>
          <p class="text-sm text-gray-400">
            Job ID: {{ job.id }}
          </p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium" :class="getStatusColor()">
          {{ job.status.toUpperCase() }}
        </span>
        <button
          v-if="job.status === 'completed' || job.status === 'failed'"
          @click="$emit('close')"
          class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-4">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm text-gray-400">Progress</span>
        <span class="text-sm font-medium text-gray-200">{{ job.progress }}%</span>
      </div>
      <div class="w-full bg-gray-700/50 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-500"
          :class="getProgressBarColor()"
          :style="{ width: `${job.progress}%` }"
        ></div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="job.status === 'failed' && job.error" class="bg-red-900/20 border border-red-800/50 rounded-lg p-4 mb-4">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
          <h4 class="text-red-300 font-medium mb-1">Processing Failed</h4>
          <p class="text-red-200 text-sm">{{ job.error }}</p>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="job.status === 'completed'" class="bg-green-900/20 border border-green-800/50 rounded-lg p-4 mb-4">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <h4 class="text-green-300 font-medium mb-1">Processing Complete</h4>
          <p class="text-green-200 text-sm">
            Successfully processed {{ job.result?.tracks.length || 0 }} tracks
            <span v-if="job.result?.playlistInfo.title">
              from "{{ job.result.playlistInfo.title }}"
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Timestamps -->
    <div class="flex justify-between text-xs text-gray-500">
      <span>Started: {{ formatTime(job.createdAt) }}</span>
      <span v-if="job.completedAt">Completed: {{ formatTime(job.completedAt) }}</span>
      <span v-else>Last updated: {{ formatTime(job.updatedAt) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JobStatus } from '@/composables/useBackgroundJobs'

interface Props {
  job: JobStatus | null
}

defineProps<Props>()
defineEmits<{
  close: []
}>()

const getStatusText = () => {
  const job = props.job
  if (!job) return ''
  
  switch (job.status) {
    case 'pending':
      return 'Waiting to start...'
    case 'processing':
      return 'Processing playlist...'
    case 'completed':
      return 'Processing completed!'
    case 'failed':
      return 'Processing failed'
    default:
      return 'Unknown status'
  }
}

const getStatusColor = () => {
  const job = props.job
  if (!job) return 'text-gray-400'
  
  switch (job.status) {
    case 'pending':
      return 'text-yellow-400'
    case 'processing':
      return 'text-blue-400'
    case 'completed':
      return 'text-green-400'
    case 'failed':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}

const getProgressBarColor = () => {
  const job = props.job
  if (!job) return 'bg-gray-500'
  
  switch (job.status) {
    case 'processing':
      return 'bg-gradient-to-r from-blue-500 to-purple-500'
    case 'completed':
      return 'bg-green-500'
    case 'failed':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString()
}

const props = defineProps<Props>()
</script>