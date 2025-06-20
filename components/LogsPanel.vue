<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-700/50">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-gray-300">Activity Logs</h2>
        <div class="flex items-center gap-2">
          <!-- Export Button -->
          <button
            @click="logsStore.exportLogs()"
            class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded transition-colors"
            title="Export logs"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          
          <!-- Clear Button -->
          <button
            @click="logsStore.clearLogs()"
            class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
            title="Clear all logs"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-2 mb-3">
        <div class="bg-gray-800/30 rounded-lg p-2">
          <div class="text-xs text-gray-400">Total</div>
          <div class="text-sm font-medium text-gray-200">{{ logStats.total }}</div>
        </div>
        <div class="bg-red-900/20 rounded-lg p-2">
          <div class="text-xs text-red-400">Errors</div>
          <div class="text-sm font-medium text-red-300">{{ logStats.error }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-1">
        <button
          v-for="(enabled, type) in logsStore.filters"
          :key="type"
          @click="logsStore.toggleFilter(type as any)"
          class="px-2 py-1 text-xs rounded-full transition-colors capitalize"
          :class="enabled 
            ? getFilterActiveClass(type) 
            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'"
        >
          {{ type }} ({{ logStats[type as keyof typeof logStats] }})
        </button>
      </div>
    </div>

    <!-- Logs List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="filteredLogs.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <div class="bg-gray-800/50 rounded-full p-4 mb-4">
          <svg class="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="text-sm font-medium">No logs available</p>
        <p class="text-xs text-gray-500 mt-1 text-center">Activity will appear here as you use the app</p>
      </div>

      <div v-else class="divide-y divide-gray-700/30">
        <div
          v-for="log in filteredLogs"
          :key="log.id"
          class="p-3 hover:bg-gray-800/30 transition-colors"
        >
          <!-- Log Header -->
          <div class="flex items-start justify-between mb-1">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <!-- Type Icon -->
              <div class="flex-shrink-0" :class="getLogIconClass(log)">
                <component :is="getLogIcon(log)" class="w-4 h-4" />
              </div>
              
              <!-- Title -->
              <h4 class="font-medium text-sm truncate" :class="getLogTitleClass(log)">
                {{ log.title }}
              </h4>
            </div>
            
            <!-- Timestamp -->
            <span class="text-xs text-gray-500 flex-shrink-0 ml-2">
              {{ formatTime(log.timestamp) }}
            </span>
          </div>

          <!-- Message -->
          <p class="text-xs text-gray-400 mb-1 pl-6">
            {{ log.message }}
          </p>

          <!-- Progress Bar (for download logs) -->
          <div v-if="log.progress !== undefined" class="pl-6 mb-2">
            <div class="w-full bg-gray-700/50 rounded-full h-1.5">
              <div 
                class="h-1.5 rounded-full transition-all duration-300"
                :class="log.level === 'error' ? 'bg-red-500' : 'bg-orange-500'"
                :style="{ width: `${log.progress}%` }"
              ></div>
            </div>
          </div>

          <!-- Details (expandable) -->
          <div v-if="log.details && expandedLogs.includes(log.id)" class="pl-6 mt-2">
            <div class="bg-gray-800/50 rounded p-2 text-xs">
              <pre class="text-gray-300 whitespace-pre-wrap">{{ JSON.stringify(log.details, null, 2) }}</pre>
            </div>
          </div>

          <!-- Expand Button -->
          <button
            v-if="log.details"
            @click="toggleLogExpansion(log.id)"
            class="pl-6 mt-1 text-xs text-gray-500 hover:text-gray-400 transition-colors"
          >
            {{ expandedLogs.includes(log.id) ? 'Hide details' : 'Show details' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLogsStore } from '@/stores/logs'
import type { LogEntry } from '@/stores/logs'

const logsStore = useLogsStore()
const expandedLogs = ref<string[]>([])

const filteredLogs = computed(() => logsStore.filteredLogs)
const logStats = computed(() => logsStore.logStats)

const toggleLogExpansion = (logId: string) => {
  const index = expandedLogs.value.indexOf(logId)
  if (index > -1) {
    expandedLogs.value.splice(index, 1)
  } else {
    expandedLogs.value.push(logId)
  }
}

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getLogIcon = (log: LogEntry) => {
  const icons = {
    download: 'svg',
    api: 'svg', 
    error: 'svg',
    system: 'svg'
  }
  return 'svg' // Sẽ được thay thế bằng component icon thực tế
}

const getLogIconClass = (log: LogEntry) => {
  const classes = {
    download: 'text-blue-400',
    api: 'text-green-400',
    error: 'text-red-400',
    system: 'text-purple-400'
  }
  return classes[log.type] || 'text-gray-400'
}

const getLogTitleClass = (log: LogEntry) => {
  const classes = {
    info: 'text-gray-200',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400'
  }
  return classes[log.level] || 'text-gray-200'
}

const getFilterActiveClass = (type: string) => {
  const classes = {
    download: 'bg-blue-900/50 text-blue-300',
    api: 'bg-green-900/50 text-green-300',
    error: 'bg-red-900/50 text-red-300',
    system: 'bg-purple-900/50 text-purple-300'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-700 text-gray-300'
}
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>