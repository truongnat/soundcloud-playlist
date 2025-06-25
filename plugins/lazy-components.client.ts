import { defineAsyncComponent, h } from 'vue'

// Lazy load heavy components to improve initial bundle size
export default defineNuxtPlugin((nuxtApp) => {
  // Register lazy components that are not immediately needed
  const lazyComponents = {
    PerformanceDashboard: () => import('~/components/PerformanceDashboard.vue'),
    PerformanceOptimizer: () => import('~/components/PerformanceOptimizer.vue'),
    OptimizationGuide: () => import('~/components/OptimizationGuide.vue'),
    LogsPanel: () => import('~/components/LogsPanel.vue'),
    BackgroundJobProgress: () => import('~/components/BackgroundJobProgress.vue')
  }

  // Register components globally but lazily
  Object.entries(lazyComponents).forEach(([name, loader]) => {
    // Components will be loaded only when needed
    const asyncComponent = defineAsyncComponent({
      loader: loader as any,
      delay: 200,
      timeout: 3000,
      loadingComponent: () => h('div', { class: 'animate-pulse bg-gray-800 rounded-lg h-32' }),
      errorComponent: () => h('div', { class: 'text-red-400 p-4' }, 'Failed to load component')
    })
    
    // Register the component globally
    nuxtApp.vueApp.component(name, asyncComponent)
  })
})