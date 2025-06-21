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
import { computed, ref, nextTick, watch, onMounted, onUnmounted, h } from 'vue'
import { useLogsStore } from '@/stores/logs'
import { useLogger } from '@/composables/useLogger'
import type { LogEntry } from '@/stores/logs'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const logsStore = useLogsStore()
const logger = useLogger()
const expandedLogs = ref<string[]>([])
const logsContainer = ref<HTMLElement>()
const autoScroll = ref(true)
const isUserScrolling = ref(false)

const filteredLogs = computed(() => logsStore.filteredLogs)
const logStats = computed(() => logsStore.logStats)

// Auto-scroll functionality
const scrollToBottom = async () => {
  if (!autoScroll.value || !logsContainer.value) return
  
  await nextTick()
  logsContainer.value.scrollTop = logsContainer.value.scrollHeight
}

const handleScroll = () => {
  if (!logsContainer.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = logsContainer.value
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
  
  if (!isAtBottom) {
    isUserScrolling.value = true
    autoScroll.value = false
  } else if (isUserScrolling.value) {
    autoScroll.value = true
    isUserScrolling.value = false
  }
}

// Watch for new logs and auto-scroll
watch(filteredLogs, () => {
  if (autoScroll.value) {
    scrollToBottom()
  }
}, { deep: true })

const toggleLogExpansion = (logId: string) => {
  const index = expandedLogs.value.indexOf(logId)
  if (index > -1) {
    expandedLogs.value.splice(index, 1)
  } else {
    expandedLogs.value.push(logId)
  }
}

const clearLogs = () => {
  logsStore.clearLogs()
  logger.logSystem('Logs Cleared', 'All activity logs have been cleared', 'info')
}

const exportLogs = () => {
  logsStore.exportLogs()
  logger.logSystem('Logs Exported', 'Activity logs exported successfully', 'success')
}

const copyErrorToClipboard = async (log: LogEntry) => {
  const errorText = `${log.title}: ${log.message}\n${log.details ? JSON.stringify(log.details, null, 2) : ''}`
  
  try {
    await navigator.clipboard.writeText(errorText)
    logger.logSystem('Error Copied', 'Error details copied to clipboard', 'success')
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
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

const formatRelativeTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (seconds < 60) return 'now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return timestamp.toLocaleDateString()
}

// Enhanced icon components
const getLogIcon = (log: LogEntry) => {
  const iconMap = {
    download: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' })
    ]),
    api: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z' })
    ]),
    error: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
    ]),
    system: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
    ])
  }
  return iconMap[log.type] || iconMap.system
}

const getFilterIcon = (type: string) => {
  const iconMap = {
    download: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' })
    ]),
    api: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z' })
    ]),
    error: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
    ]),
    system: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
    ])
  }
  return iconMap[type as keyof typeof iconMap] || iconMap.system
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

const getLogRowClass = (log: LogEntry) => {
  if (log.level === 'error') return 'border-l-2 border-red-500/50 bg-red-900/5'
  if (log.level === 'warning') return 'border-l-2 border-yellow-500/50 bg-yellow-900/5'
  if (log.level === 'success') return 'border-l-2 border-green-500/50 bg-green-900/5'
  return ''
}

const getLogStatusBadge = (log: LogEntry) => {
  if (log.type === 'download' && log.progress !== undefined) {
    if (log.progress === 100) {
      return { text: 'Complete', class: 'bg-green-900/50 text-green-300' }
    } else if (log.level === 'error') {
      return { text: 'Failed', class: 'bg-red-900/50 text-red-300' }
    } else {
      return { text: 'Downloading', class: 'bg-blue-900/50 text-blue-300' }
    }
  }
  return null
}

const getProgressBarClass = (log: LogEntry) => {
  if (log.level === 'error') return 'bg-red-500'
  if (log.progress === 100) return 'bg-green-500'
  return 'bg-gradient-to-r from-blue-500 to-purple-500'
}

const getApiStatusClass = (status: number) => {
  if (status >= 200 && status < 300) return 'bg-green-900/50 text-green-300'
  if (status >= 400 && status < 500) return 'bg-yellow-900/50 text-yellow-300'
  if (status >= 500) return 'bg-red-900/50 text-red-300'
  return 'bg-gray-700/50 text-gray-300'
}

const getFilterActiveClass = (type: string) => {
  const classes = {
    download: 'bg-blue-900/50 text-blue-300 border border-blue-500/30',
    api: 'bg-green-900/50 text-green-300 border border-green-500/30',
    error: 'bg-red-900/50 text-red-300 border border-red-500/30',
    system: 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
  }
  return classes[type as keyof typeof classes] || 'bg-gray-700 text-gray-300'
}

// Initialize auto-logging on mount
onMounted(() => {
  logger.setupAutoLogging()
  logger.logAppStart()
  scrollToBottom()
})

onUnmounted(() => {
  // Clean up any intervals or listeners if needed
})
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

/* Enhanced animations */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

/* Smooth transitions for log entries */
.group {
  transition: all 0.2s ease;
}

.group:hover {
  transform: translateX(2px);
}

/* Progress bar animations */
.progress-bar {
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

/* Status indicators */
.status-online {
  position: relative;
}

.status-online::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: inherit;
  border-radius: inherit;
  transform: translate(-50%, -50%);
  animation: pulse 2s infinite;
}

/* Filter button enhancements */
.filter-button {
  position: relative;
  overflow: hidden;
}

.filter-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.filter-button:hover::before {
  left: 100%;
}

/* Log entry animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.log-entry {
  animation: slideInLeft 0.3s ease-out;
}

/* Error log highlighting */
.error-log {
  position: relative;
}

.error-log::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #ef4444, #dc2626);
  border-radius: 0 2px 2px 0;
}

/* Success log highlighting */
.success-log {
  position: relative;
}

.success-log::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #10b981, #059669);
  border-radius: 0 2px 2px 0;
}

/* Warning log highlighting */
.warning-log {
  position: relative;
}

.warning-log::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #f59e0b, #d97706);
  border-radius: 0 2px 2px 0;
}

/* Pulse animation for active elements */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Glow effect for important logs */
.important-log {
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

/* Fade in animation for new logs */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.new-log {
  animation: fadeIn 0.5s ease-out;
}

/* Enhanced hover effects */
.hover-lift:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Loading spinner for active downloads */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

/* Gradient text effects */
.gradient-text {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .log-entry {
    padding: 0.75rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .filter-buttons {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .glass-effect {
    backdrop-filter: blur(10px);
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(75, 85, 99, 0.3);
  }
}

/* Focus states for accessibility */
button:focus-visible,
.focusable:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .log-entry {
    border: 1px solid currentColor;
  }
  
  .progress-bar {
    border: 1px solid currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>