<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-700/50">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 class="text-lg font-semibold text-gray-200">Activity Monitor</h2>
        </div>
        <div class="flex items-center gap-2">
          <!-- Auto-scroll Toggle -->
          <button
            @click="autoScroll = !autoScroll"
            class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded transition-colors"
            :class="{ 'text-green-400': autoScroll }"
            title="Toggle auto-scroll"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          
          <!-- Export Button -->
          <button
            @click="exportLogs"
            class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded transition-colors"
            title="Export logs"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          
          <!-- Clear Button -->
          <button
            @click="clearLogs"
            class="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
            title="Clear all logs"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Enhanced Stats Grid -->
      <div class="grid grid-cols-2 gap-2 mb-3">
        <div class="bg-gray-800/30 rounded-lg p-2">
          <div class="text-xs text-gray-400">Total Logs</div>
          <div class="text-sm font-medium text-gray-200">{{ logStats.total }}</div>
        </div>
        <div class="bg-red-900/20 rounded-lg p-2">
          <div class="text-xs text-red-400">Errors</div>
          <div class="text-sm font-medium text-red-300">{{ logStats.error }}</div>
        </div>
        <div class="bg-blue-900/20 rounded-lg p-2">
          <div class="text-xs text-blue-400">Downloads</div>
          <div class="text-sm font-medium text-blue-300">{{ logStats.download }}</div>
        </div>
        <div class="bg-green-900/20 rounded-lg p-2">
          <div class="text-xs text-green-400">API Calls</div>
          <div class="text-sm font-medium text-green-300">{{ logStats.api }}</div>
        </div>
      </div>

      <!-- Enhanced Filters -->
      <div class="flex flex-wrap gap-1">
        <button
          v-for="(enabled, type) in logsStore.filters"
          :key="type"
          @click="logsStore.toggleFilter(type as any)"
          class="px-2 py-1 text-xs rounded-full transition-all duration-200 capitalize flex items-center gap-1"
          :class="enabled 
            ? getFilterActiveClass(type) 
            : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'"
        >
          <component :is="getFilterIcon(type)" class="w-3 h-3" />
          {{ type }} ({{ logStats[type as keyof typeof logStats] }})
        </button>
      </div>
    </div>

    <!-- Logs List -->
    <div ref="logsContainer" class="flex-1 overflow-y-auto" @scroll="handleScroll">
      <div v-if="filteredLogs.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <div class="bg-gray-800/50 rounded-full p-4 mb-4">
          <svg class="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="text-sm font-medium">No activity yet</p>
        <p class="text-xs text-gray-500 mt-1 text-center">Download progress, API requests, and system events will appear here</p>
      </div>

      <div v-else class="divide-y divide-gray-700/30">
        <div
          v-for="log in filteredLogs"
          :key="log.id"
          class="p-3 hover:bg-gray-800/30 transition-colors group"
          :class="getLogRowClass(log)"
        >
          <!-- Log Header -->
          <div class="flex items-start justify-between mb-1">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <!-- Type Icon with Animation -->
              <div class="flex-shrink-0 relative" :class="getLogIconClass(log)">
                <component :is="getLogIcon(log)" class="w-4 h-4" />
                <!-- Pulse animation for active downloads -->
                <div v-if="log.type === 'download' && log.progress !== undefined && log.progress < 100"
                     class="absolute inset-0 rounded-full animate-ping opacity-20 bg-current"></div>
              </div>
              
              <!-- Title with Status Badge -->
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <h4 class="font-medium text-sm truncate" :class="getLogTitleClass(log)">
                  {{ log.title }}
                </h4>
                <span v-if="getLogStatusBadge(log)" 
                      class="px-1.5 py-0.5 text-xs rounded-full flex-shrink-0"
                      :class="getLogStatusBadge(log)?.class">
                  {{ getLogStatusBadge(log)?.text }}
                </span>
              </div>
            </div>
            
            <!-- Timestamp with Relative Time -->
            <div class="flex flex-col items-end text-xs text-gray-500 flex-shrink-0 ml-2">
              <span>{{ formatTime(log.timestamp) }}</span>
              <span class="text-gray-600">{{ formatRelativeTime(log.timestamp) }}</span>
            </div>
          </div>

          <!-- Message -->
          <p class="text-xs text-gray-400 mb-1 pl-6 break-words">
            {{ log.message }}
          </p>

          <!-- Enhanced Progress Bar (for download logs) -->
          <div v-if="log.progress !== undefined" class="pl-6 mb-2">
            <div class="flex items-center gap-2 mb-1">
              <div class="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-500 relative"
                  :class="getProgressBarClass(log)"
                  :style="{ width: `${Math.max(log.progress, 2)}%` }"
                >
                  <!-- Shimmer effect for active downloads -->
                  <div v-if="log.progress < 100 && log.level !== 'error'"
                       class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              </div>
              <span class="text-xs font-mono text-gray-400 min-w-[3rem] text-right">
                {{ log.progress }}%
              </span>
            </div>
          </div>

          <!-- API Status Indicator -->
          <div v-if="log.type === 'api' && log.details?.status" class="pl-6 mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono px-2 py-1 rounded"
                    :class="getApiStatusClass(log.details.status)">
                {{ log.details.status }}
              </span>
              <span v-if="log.details.method" class="text-xs text-gray-500 uppercase">
                {{ log.details.method }}
              </span>
            </div>
          </div>

          <!-- System Status Indicator -->
          <div v-if="log.type === 'system' && log.level === 'success'" class="pl-6 mb-2">
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-xs text-green-400">Online</span>
            </div>
          </div>

          <!-- Details (expandable with better formatting) -->
          <div v-if="log.details && expandedLogs.includes(log.id)" class="pl-6 mt-2">
            <div class="bg-gray-800/50 rounded-lg p-3 text-xs border border-gray-700/50">
              <div v-if="typeof log.details === 'object'">
                <div v-for="(value, key) in log.details" :key="key" class="mb-2 last:mb-0">
                  <span class="text-gray-400 font-medium">{{ key }}:</span>
                  <span class="text-gray-300 ml-2">
                    {{ typeof value === 'object' ? JSON.stringify(value, null, 2) : value }}
                  </span>
                </div>
              </div>
              <pre v-else class="text-gray-300 whitespace-pre-wrap">{{ log.details }}</pre>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 pl-6 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              v-if="log.details"
              @click="toggleLogExpansion(log.id)"
              class="text-xs text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      :d="expandedLogs.includes(log.id) ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'" />
              </svg>
              {{ expandedLogs.includes(log.id) ? 'Hide details' : 'Show details' }}
            </button>
            
            <button
              v-if="log.type === 'error'"
              @click="copyErrorToClipboard(log)"
              class="text-xs text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1"
            >
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy error
            </button>
          </div>
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