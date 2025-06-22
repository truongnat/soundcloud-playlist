import { ref, computed, watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export const useTheme = () => {
  const settingsStore = useSettingsStore()
  const systemPrefersDark = ref(false)
  
  // Media query for system theme preference
  let mediaQuery: MediaQueryList | null = null
  
  // Initialize system theme detection
  const initSystemThemeDetection = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemPrefersDark.value = mediaQuery.matches
      
      // Listen for system theme changes
      const handleChange = (e: MediaQueryListEvent) => {
        systemPrefersDark.value = e.matches
        if (settingsStore.settings.theme === 'auto') {
          applyTheme()
        }
      }
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange)
      }
    }
  }
  
  // Computed current theme
  const currentTheme = computed(() => {
    const theme = settingsStore.settings.theme
    if (theme === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return theme
  })
  
  // Apply theme to document
  const applyTheme = () => {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    const theme = currentTheme.value
    
    // Remove existing theme classes
    root.classList.remove('dark', 'light')
    
    // Add current theme class
    root.classList.add(theme)
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff')
    }
    
    // Update CSS custom properties for theme
    const colors = theme === 'dark' ? {
      '--bg-primary': '#111827',
      '--bg-secondary': '#1f2937',
      '--bg-tertiary': '#374151',
      '--text-primary': '#f9fafb',
      '--text-secondary': '#d1d5db',
      '--text-tertiary': '#9ca3af',
      '--border-primary': '#4b5563',
      '--border-secondary': '#6b7280',
      '--accent-primary': '#3b82f6',
      '--accent-secondary': '#1d4ed8',
      '--success': '#10b981',
      '--warning': '#f59e0b',
      '--error': '#ef4444'
    } : {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f9fafb',
      '--bg-tertiary': '#f3f4f6',
      '--text-primary': '#111827',
      '--text-secondary': '#374151',
      '--text-tertiary': '#6b7280',
      '--border-primary': '#d1d5db',
      '--border-secondary': '#9ca3af',
      '--accent-primary': '#3b82f6',
      '--accent-secondary': '#1d4ed8',
      '--success': '#10b981',
      '--warning': '#f59e0b',
      '--error': '#ef4444'
    }
    
    Object.entries(colors).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
    
    console.log(`[Theme] Applied theme: ${theme}`)
  }
  
  // Set theme
  const setTheme = (theme: 'dark' | 'light' | 'auto') => {
    settingsStore.updateSetting('theme', theme)
    applyTheme()
  }
  
  // Toggle between dark and light (ignores auto)
  const toggleTheme = () => {
    const current = settingsStore.settings.theme
    if (current === 'auto') {
      // If auto, switch to opposite of current system preference
      setTheme(systemPrefersDark.value ? 'light' : 'dark')
    } else {
      // Toggle between dark and light
      setTheme(current === 'dark' ? 'light' : 'dark')
    }
  }
  
  // Get theme icon
  const getThemeIcon = (theme?: 'dark' | 'light' | 'auto') => {
    const targetTheme = theme || settingsStore.settings.theme
    
    switch (targetTheme) {
      case 'dark':
        return 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
      case 'light':
        return 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
      case 'auto':
        return 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
      default:
        return 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    }
  }
  
  // Get theme display name
  const getThemeDisplayName = (theme?: 'dark' | 'light' | 'auto') => {
    const targetTheme = theme || settingsStore.settings.theme
    
    switch (targetTheme) {
      case 'dark':
        return 'Dark'
      case 'light':
        return 'Light'
      case 'auto':
        return `Auto (${systemPrefersDark.value ? 'Dark' : 'Light'})`
      default:
        return 'Unknown'
    }
  }
  
  // Watch for theme changes
  watch(
    () => settingsStore.settings.theme,
    () => {
      applyTheme()
    },
    { immediate: false }
  )
  
  // Watch for system theme changes when in auto mode
  watch(
    systemPrefersDark,
    () => {
      if (settingsStore.settings.theme === 'auto') {
        applyTheme()
      }
    }
  )
  
  // Initialize on mount
  onMounted(() => {
    initSystemThemeDetection()
    applyTheme()
  })
  
  return {
    // State
    currentTheme,
    systemPrefersDark: computed(() => systemPrefersDark.value),
    
    // Methods
    setTheme,
    toggleTheme,
    applyTheme,
    getThemeIcon,
    getThemeDisplayName,
    
    // Computed
    isDark: computed(() => currentTheme.value === 'dark'),
    isLight: computed(() => currentTheme.value === 'light'),
    isAuto: computed(() => settingsStore.settings.theme === 'auto')
  }
}