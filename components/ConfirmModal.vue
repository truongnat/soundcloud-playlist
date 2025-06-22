<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" @click="handleCancel"></div>
        
        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 max-w-md w-full mx-4 transform transition-all">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-700/50">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-full" :class="iconBgClass">
                  <svg class="w-6 h-6" :class="iconClass" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-100">{{ title }}</h3>
              </div>
              <button
                @click="handleCancel"
                class="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-6">
              <p class="text-gray-300 leading-relaxed">{{ message }}</p>
              
              <!-- Additional info if provided -->
              <div v-if="additionalInfo" class="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                <p class="text-sm text-gray-400">{{ additionalInfo }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-700/50">
              <button
                @click="handleCancel"
                class="px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                {{ cancelText }}
              </button>
              <button
                @click="handleConfirm"
                class="px-6 py-2 font-medium rounded-lg transition-colors"
                :class="confirmButtonClass"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  title: string
  message: string
  additionalInfo?: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'warning'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const iconPath = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    case 'info':
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    default: // warning
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
  }
})

const iconClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'text-red-400'
    case 'info':
      return 'text-blue-400'
    default: // warning
      return 'text-yellow-400'
  }
})

const iconBgClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-900/20'
    case 'info':
      return 'bg-blue-900/20'
    default: // warning
      return 'bg-yellow-900/20'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white'
    case 'info':
      return 'bg-blue-600 hover:bg-blue-700 text-white'
    default: // warning
      return 'bg-yellow-600 hover:bg-yellow-700 text-white'
  }
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

// Handle ESC key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.show) {
    handleCancel()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>