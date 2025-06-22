/**
 * Audio processing utilities
 */

export function validateAudioFormat(data: Uint8Array): { isMP3: boolean; isM4A: boolean } {
  const isMP3 = data[0] === 0xFF && (data[1] & 0xE0) === 0xE0
  const isM4A = (
    data[4] === 0x66 && // f
    data[5] === 0x74 && // t
    data[6] === 0x79 && // y
    data[7] === 0x70    // p
  )
  
  return { isMP3, isM4A }
}

export function validateMP3Output(data: Uint8Array): boolean {
  if (data.length === 0) {
    return false
  }

  // Check for ID3v2 tag
  const hasID3 = data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33 // "ID3"
  let offset = 0
  
  if (hasID3) {
    // Skip ID3v2 tag if present
    const id3Size = ((data[6] & 0x7f) << 21) | ((data[7] & 0x7f) << 14) | ((data[8] & 0x7f) << 7) | (data[9] & 0x7f)
    offset = id3Size + 10
  }
  
  // Check for MP3 sync word (0xFFF) after ID3 tag if present
  return (data[offset] === 0xFF && (data[offset + 1] & 0xE0) === 0xE0) || 
         (data[offset] === 0xFF && data[offset + 1] === 0xFB)
}

export async function downloadBlob(blob: Blob, filename: string, customPath?: string): Promise<void> {
  // Check if we're running on the client side
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('downloadBlob can only be called on the client side')
  }
  
  // Try to use File System Access API if available and custom path is provided
  if (customPath && 'showSaveFilePicker' in window) {
    try {
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'MP3 files',
          accept: { 'audio/mpeg': ['.mp3'] }
        }]
      })
      
      const writable = await fileHandle.createWritable()
      await writable.write(blob)
      await writable.close()
      
      console.log(`File saved to custom location: ${filename}`)
      return
    } catch (error: any) {
      // User cancelled or API not supported, fall back to default download
      if (error.name !== 'AbortError') {
        console.warn('File System Access API failed, falling back to default download:', error)
      }
    }
  }
  
  // Fallback to default browser download
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  
  // Add custom path info to the filename if provided
  if (customPath && customPath !== '~/Downloads') {
    // Note: Browser will still save to default download folder
    // This is just for user information
    console.log(`Note: File will be downloaded to browser's default download folder. Intended path: ${customPath}`)
  }
  
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

// Helper function to show download path info
export function getDownloadInfo(customPath?: string): { 
  actualPath: string, 
  isCustomPath: boolean,
  message: string 
} {
  const isCustomPath = customPath && customPath !== '~/Downloads'
  const actualPath = isCustomPath ? customPath : 'Browser default download folder'
  
  let message = ''
  if (isCustomPath) {
    if ('showSaveFilePicker' in window) {
      message = `Will attempt to save to: ${customPath}`
    } else {
      message = `Will save to browser default folder (${customPath} not supported)`
    }
  } else {
    message = 'Will save to browser default download folder'
  }
  
  return { actualPath, isCustomPath: !!isCustomPath, message }
}