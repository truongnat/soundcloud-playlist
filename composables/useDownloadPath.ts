import { ref, computed } from 'vue'

export const useDownloadPath = () => {
  const downloadPath = ref('~/Downloads')
  
  // Load download path from localStorage
  const loadDownloadPath = () => {
    try {
      const saved = localStorage.getItem('download-settings')
      if (saved) {
        const settings = JSON.parse(saved)
        downloadPath.value = settings.downloadPath || '~/Downloads'
      }
    } catch (error) {
      console.error('Failed to load download path:', error)
      downloadPath.value = '~/Downloads'
    }
  }
  
  // Save download path to localStorage
  const saveDownloadPath = (path: string) => {
    try {
      const settings = {
        downloadPath: path
      }
      localStorage.setItem('download-settings', JSON.stringify(settings))
      downloadPath.value = path
      console.log('Download path saved:', path)
    } catch (error) {
      console.error('Failed to save download path:', error)
    }
  }
  
  // Get the current download path
  const getCurrentDownloadPath = computed(() => {
    return downloadPath.value
  })
  
  // Resolve path (convert ~ to actual home directory if needed)
  const getResolvedPath = computed(() => {
    let path = downloadPath.value
    
    // In a browser environment, we can't actually resolve ~ to home directory
    // This would be handled by the backend/electron app
    if (path.startsWith('~/')) {
      // For now, just return the path as-is
      // In a real implementation, this would be resolved by the backend
      return path
    }
    
    return path
  })
  
  // Check if path is valid (basic validation)
  const isValidPath = computed(() => {
    const path = downloadPath.value
    if (!path || path.trim().length === 0) {
      return false
    }
    
    // Basic path validation
    // In a real implementation, you'd want more robust validation
    const invalidChars = /[<>:"|?*]/
    return !invalidChars.test(path)
  })
  
  // Initialize on first use
  loadDownloadPath()
  
  return {
    downloadPath: computed(() => downloadPath.value),
    getCurrentDownloadPath,
    getResolvedPath,
    isValidPath,
    saveDownloadPath,
    loadDownloadPath
  }
}