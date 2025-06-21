import { ref } from 'vue'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import type { FFmpegType } from '@/types'
import { validateAudioFormat, validateMP3Output } from '~/utils/audio'
import { useDownloadPerformance } from './useDownloadPerformance'

export const useAudioProcessor = () => {
  const ffmpeg = ref<FFmpegType>()
  const isLoadingFFmpeg = ref(false)
  const { settings: performanceSettings } = useDownloadPerformance()
  
  // Detect number of CPU cores for optimal threading
  const getOptimalThreadCount = (): number => {
    if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
      // Use half of available cores, capped at 8 for optimal performance
      return Math.min(Math.max(Math.floor(navigator.hardwareConcurrency / 2), 1), 8)
    }
    return 4 // Default fallback
  }
  
  const initFFmpeg = async () => {
    // Ensure we're running on the client side
    if (typeof window === 'undefined') {
      throw new Error('FFmpeg can only be initialized on the client side')
    }
    
    if (ffmpeg.value?.loaded) {
      console.log('FFmpeg already loaded')
      return
    }
    
    try {
      isLoadingFFmpeg.value = true
      console.log('Starting FFmpeg initialization...')
      
      // Always start with single-threaded version for better compatibility
      ffmpeg.value = new FFmpeg()
      
      // Try to load FFmpeg with multiple fallback strategies
      let loadSuccess = false
      
      // Strategy 1: Try default single-threaded load
      try {
        console.log('Attempting default FFmpeg load...')
        await ffmpeg.value.load()
        loadSuccess = true
        console.log('FFmpeg loaded successfully (default)')
      } catch (defaultError) {
        console.warn('Default FFmpeg load failed:', defaultError)
      }
      
      // Strategy 2: Try with explicit CDN URLs if default failed
      if (!loadSuccess) {
        try {
          console.log('Attempting FFmpeg load with explicit CDN URLs...')
          const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm'
          
          await ffmpeg.value.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          })
          loadSuccess = true
          console.log('FFmpeg loaded successfully (explicit CDN)')
        } catch (cdnError) {
          console.warn('CDN FFmpeg load failed:', cdnError)
        }
      }
      
      // Strategy 3: Try alternative CDN if previous attempts failed
      if (!loadSuccess) {
        try {
          console.log('Attempting FFmpeg load with alternative CDN...')
          const altBaseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'
          
          await ffmpeg.value.load({
            coreURL: await toBlobURL(`${altBaseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${altBaseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          })
          loadSuccess = true
          console.log('FFmpeg loaded successfully (alternative CDN)')
        } catch (altError) {
          console.warn('Alternative CDN FFmpeg load failed:', altError)
        }
      }
      
      // Strategy 4: Try with a fresh FFmpeg instance if still failing
      if (!loadSuccess) {
        try {
          console.log('Attempting FFmpeg load with fresh instance...')
          ffmpeg.value = new FFmpeg()
          await ffmpeg.value.load()
          loadSuccess = true
          console.log('FFmpeg loaded successfully (fresh instance)')
        } catch (freshError) {
          console.warn('Fresh instance FFmpeg load failed:', freshError)
        }
      }
      
      if (!loadSuccess) {
        throw new Error('All FFmpeg loading strategies failed')
      }
      
      // Give FFmpeg a moment to fully initialize
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Verify FFmpeg is actually loaded - be more lenient with the check
      if (!ffmpeg.value || typeof ffmpeg.value.exec !== 'function') {
        throw new Error('FFmpeg not properly initialized - missing exec function')
      }
      
      console.log('FFmpeg initialization completed successfully')
      console.log('FFmpeg loaded state:', ffmpeg.value.loaded)
      console.log('FFmpeg has exec function:', typeof ffmpeg.value.exec === 'function')
      
      // Test FFmpeg with a simple command to ensure it's working
      try {
        console.log('Testing FFmpeg functionality...')
        await ffmpeg.value.exec(['-version'])
        console.log('FFmpeg test successful')
      } catch (testError) {
        console.warn('FFmpeg test failed, but continuing anyway:', testError)
        // Don't throw here, as some FFmpeg builds might not support -version
      }
      
    } catch (error) {
      console.error('FFmpeg initialization failed completely:', error)
      ffmpeg.value = undefined
      throw new Error('Failed to load audio converter. Please check your internet connection and try again.')
    } finally {
      isLoadingFFmpeg.value = false
    }
  }
  const MAX_INPUT_SIZE = 100 * 1024 * 1024 // 100MB
  const CONVERSION_TIMEOUT = 5 * 60 * 1000 // 5 minutes

  const reinitializeFFmpeg = async () => {
    console.log('Reinitializing FFmpeg due to error...')
    ffmpeg.value = undefined
    await initFFmpeg()
  }

  const convertToMp3 = async (inputData: Uint8Array): Promise<Blob> => {
    console.log('Starting audio conversion, input size:', inputData.length)
    
    let retryCount = 0
    const maxRetries = 2
    
    while (retryCount <= maxRetries) {
      try {
        // Check input size
        if (inputData.length > MAX_INPUT_SIZE) {
          throw new Error('Input file too large (max 100MB)')
        }

        console.log('Initializing FFmpeg...')
        await initFFmpeg()
      
      if (!ffmpeg.value) {
        throw new Error('FFmpeg not initialized')
      }

      if (typeof ffmpeg.value.exec !== 'function') {
        throw new Error('FFmpeg not properly loaded - missing exec function')
      }

      console.log('FFmpeg initialized successfully, writing input file...')
      
      // Verify input data format before conversion
      const { isMP3, isM4A } = validateAudioFormat(inputData)
      
      console.log('Input format:', isMP3 ? 'MP3' : isM4A ? 'M4A' : 'Unknown')
      
      if (!isMP3 && !isM4A) {
        throw new Error('Unsupported input format - not MP3 or M4A')
      }
      
      // Clean up any existing files first
      try {
        await ffmpeg.value.deleteFile('input.audio')
        await ffmpeg.value.deleteFile('output.mp3')
      } catch (cleanupError) {
        // Ignore cleanup errors - files might not exist
        console.log('Cleanup before conversion (expected):', cleanupError)
      }
      
      // Write input file with error handling
      try {
        await ffmpeg.value.writeFile('input.audio', inputData)
        console.log('Input file written successfully')
      } catch (writeError) {
        console.error('Failed to write input file:', writeError)
        throw new Error('Failed to write input file to FFmpeg filesystem')
      }
      
      console.log('Starting MP3 conversion...')
      
      // Build simplified FFmpeg command for better compatibility
      const ffmpegArgs = [
        '-i', 'input.audio',
        '-acodec', 'libmp3lame',           // Explicitly set audio codec
        '-ar', '44100',                    // Set sample rate
        '-ac', '2',                        // Set to stereo
        '-b:a', performanceSettings.value.audioQuality, // Use dynamic bitrate
        '-f', 'mp3',                       // Force MP3 format
        '-y',                              // Overwrite output
        'output.mp3'
      ]

      console.log('FFmpeg command:', ffmpegArgs.join(' '))
      
      // Reduced timeout for faster failure detection
      const REDUCED_TIMEOUT = 60 * 1000 // 1 minute
      const conversionPromise = ffmpeg.value.exec(ffmpegArgs)

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Conversion timeout (1 minute)')), REDUCED_TIMEOUT)
      })

      try {
        console.log('Executing FFmpeg conversion command...')
        await Promise.race([conversionPromise, timeoutPromise])
        console.log('FFmpeg conversion completed successfully')
      } catch (error: unknown) {
        console.error('Conversion error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // Check if it's a filesystem error
        if (errorMessage.includes('FS error') || errorMessage.includes('ErrnoError')) {
          throw new Error('FFmpeg filesystem error - try refreshing the page and trying again')
        }
        
        throw new Error(`Conversion failed: ${errorMessage}`)
      }
      
      console.log('Reading output file from FFmpeg...')
      let data: Uint8Array
      try {
        const fileData = await ffmpeg.value.readFile('output.mp3')
        if (!(fileData instanceof Uint8Array)) {
          throw new Error('Output file is not Uint8Array')
        }
        data = fileData
        console.log('Output file read, size:', data.length)
      } catch (readError) {
        console.error('Failed to read output file:', readError)
        throw new Error('Failed to read converted file from FFmpeg filesystem')
      }
      
      if (!(data instanceof Uint8Array)) {
        console.error('Output is not Uint8Array:', typeof data)
        throw new Error('Invalid output type')
      }
      
      if (data.length === 0) {
        console.error('Output file is empty')
        throw new Error('Empty output file')
      }

      // Log first few bytes for debugging
      console.log('Output file first bytes:', Array.from(data.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' '))
      
      // Validate MP3 output
      if (!validateMP3Output(data)) {
        throw new Error('Invalid MP3 format: No valid MP3 frame found')
      }

      console.log('MP3 validation successful, creating blob...')
      const blob = new Blob([data], { type: 'audio/mpeg' })
      console.log('Blob created successfully, size:', blob.size)
        return blob

      } catch (error) {
        console.error(`Error converting to MP3 (attempt ${retryCount + 1}):`, error)
        
        let errorMessage = 'Unknown error during conversion'
        let shouldRetry = false
        
        if (error instanceof Error) {
          if (error.message.includes('FS error') || error.message.includes('ErrnoError') || error.message.includes('filesystem')) {
            errorMessage = 'FFmpeg filesystem error'
            shouldRetry = retryCount < maxRetries
          } else if (error.message.includes('timeout')) {
            errorMessage = 'Conversion took too long'
          } else if (error.message.includes('EBML')) {
            errorMessage = 'Invalid input format'
          } else if (error.message.includes('too large')) {
            errorMessage = 'File too large'
          } else {
            errorMessage = error.message
          }
        }
        
        // Cleanup before retry or final error
        try {
          if (ffmpeg.value) {
            await Promise.race([
              Promise.all([
                ffmpeg.value.deleteFile('input.audio'),
                ffmpeg.value.deleteFile('output.mp3')
              ]),
              new Promise(r => setTimeout(r, 2000)) // 2s timeout for cleanup
            ])
          }
        } catch (cleanupError) {
          console.warn('Cleanup error:', cleanupError)
        }
        
        if (shouldRetry) {
          retryCount++
          console.log(`Retrying conversion (${retryCount}/${maxRetries})...`)
          await reinitializeFFmpeg()
          continue // Retry the conversion
        } else {
          throw new Error('Failed to convert audio: ' + errorMessage)
        }
      }
    }
    
    throw new Error('Failed to convert audio after all retries')
  }

  return {
    isLoadingFFmpeg,
    convertToMp3
  }
}
