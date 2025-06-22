import { ref, computed } from 'vue'

export interface PermissionStatus {
  granted: boolean
  denied: boolean
  prompt: boolean
  unsupported: boolean
}

export const usePermissions = () => {
  const downloadPermission = ref<PermissionStatus>({
    granted: false,
    denied: false,
    prompt: true,
    unsupported: false
  })
  
  const directoryPermission = ref<PermissionStatus>({
    granted: false,
    denied: false,
    prompt: true,
    unsupported: false
  })

  // Check if File System Access API is supported
  const isFileSystemAccessSupported = computed(() => {
    return 'showDirectoryPicker' in window && 'showSaveFilePicker' in window
  })

  // Check if download permission is supported
  const isDownloadPermissionSupported = computed(() => {
    return 'permissions' in navigator && 'query' in navigator.permissions
  })

  // Request download permission (for multiple files)
  const requestDownloadPermission = async (): Promise<boolean> => {
    try {
      // Check if permissions API is supported
      if (!isDownloadPermissionSupported.value) {
        console.log('Permissions API not supported, assuming granted')
        downloadPermission.value = {
          granted: true,
          denied: false,
          prompt: false,
          unsupported: true
        }
        return true
      }

      // Query current permission status
      const permission = await navigator.permissions.query({ name: 'downloads' as any })
      
      updateDownloadPermissionStatus(permission.state)
      
      // Listen for permission changes
      permission.addEventListener('change', () => {
        updateDownloadPermissionStatus(permission.state)
      })

      return downloadPermission.value.granted
    } catch (error) {
      console.warn('Failed to check download permission:', error)
      // Assume granted if we can't check
      downloadPermission.value = {
        granted: true,
        denied: false,
        prompt: false,
        unsupported: true
      }
      return true
    }
  }

  // Update download permission status
  const updateDownloadPermissionStatus = (state: PermissionState) => {
    downloadPermission.value = {
      granted: state === 'granted',
      denied: state === 'denied',
      prompt: state === 'prompt',
      unsupported: false
    }
  }

  // Request directory access permission
  const requestDirectoryPermission = async (): Promise<FileSystemDirectoryHandle | null> => {
    try {
      if (!isFileSystemAccessSupported.value) {
        console.log('File System Access API not supported')
        directoryPermission.value = {
          granted: false,
          denied: false,
          prompt: false,
          unsupported: true
        }
        return null
      }

      // Show directory picker
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      })

      directoryPermission.value = {
        granted: true,
        denied: false,
        prompt: false,
        unsupported: false
      }

      return dirHandle
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User cancelled
        directoryPermission.value = {
          granted: false,
          denied: false,
          prompt: true,
          unsupported: false
        }
      } else {
        // Permission denied or other error
        directoryPermission.value = {
          granted: false,
          denied: true,
          prompt: false,
          unsupported: false
        }
      }
      console.warn('Directory permission request failed:', error)
      return null
    }
  }

  // Request permission to save file to specific location
  const requestSaveFilePermission = async (filename: string): Promise<FileSystemFileHandle | null> => {
    try {
      if (!isFileSystemAccessSupported.value) {
        console.log('File System Access API not supported')
        return null
      }

      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'MP3 files',
          accept: { 'audio/mpeg': ['.mp3'] }
        }]
      })

      return fileHandle
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.warn('Save file permission request failed:', error)
      }
      return null
    }
  }

  // Check and request all necessary permissions
  const checkAndRequestPermissions = async (): Promise<{
    download: boolean
    directory: FileSystemDirectoryHandle | null
  }> => {
    const downloadGranted = await requestDownloadPermission()
    const directoryHandle = await requestDirectoryPermission()

    return {
      download: downloadGranted,
      directory: directoryHandle
    }
  }

  // Show permission status to user
  const getPermissionStatusMessage = () => {
    const messages: string[] = []

    if (downloadPermission.value.unsupported) {
      messages.push('✓ Download permission: Assumed granted (API not supported)')
    } else if (downloadPermission.value.granted) {
      messages.push('✓ Download permission: Granted')
    } else if (downloadPermission.value.denied) {
      messages.push('✗ Download permission: Denied')
    } else {
      messages.push('? Download permission: Not requested')
    }

    if (directoryPermission.value.unsupported) {
      messages.push('✗ Directory access: Not supported by browser')
    } else if (directoryPermission.value.granted) {
      messages.push('✓ Directory access: Granted')
    } else if (directoryPermission.value.denied) {
      messages.push('✗ Directory access: Denied')
    } else {
      messages.push('? Directory access: Not requested')
    }

    return messages
  }

  // Reset permissions (for testing)
  const resetPermissions = () => {
    downloadPermission.value = {
      granted: false,
      denied: false,
      prompt: true,
      unsupported: false
    }
    
    directoryPermission.value = {
      granted: false,
      denied: false,
      prompt: true,
      unsupported: false
    }
  }

  return {
    // State
    downloadPermission: computed(() => downloadPermission.value),
    directoryPermission: computed(() => directoryPermission.value),
    isFileSystemAccessSupported,
    isDownloadPermissionSupported,

    // Methods
    requestDownloadPermission,
    requestDirectoryPermission,
    requestSaveFilePermission,
    checkAndRequestPermissions,
    getPermissionStatusMessage,
    resetPermissions
  }
}