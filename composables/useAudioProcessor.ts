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
    if (ffmpeg.value?.loaded) {
      console.log('FFmpeg already loaded')
      return
    }
    
    try {
      isLoadingFFmpeg.value = true
      
      // Check if SharedArrayBuffer is available for multi-threading
      const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined'
      console.log('SharedArrayBuffer available:', hasSharedArrayBuffer)
      
      if (hasSharedArrayBuffer && performanceSettings.enableMultiThreading) {
        console.log('Starting FFmpeg initialization with multi-threading support')
        
        // Create FFmpeg instance with multi-threading configuration
        ffmpeg.value = new FFmpeg()
        
        // Load FFmpeg with multi-threading support
        const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm'
        
        await ffmpeg.value.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        })
        
        console.log('FFmpeg loaded successfully with multi-threading support')
      } else {
        console.log('Starting FFmpeg initialization (single-threaded)')
        ffmpeg.value = new FFmpeg()
        await ffmpeg.value.load()
        console.log('FFmpeg loaded successfully (single-threaded)')
      }
    } catch (error) {
      console.error('Error loading FFmpeg:', error)
      // Fallback to single-threaded version
      try {
        console.log('Falling back to single-threaded FFmpeg')
        ffmpeg.value = new FFmpeg()
        await ffmpeg.value.load()
        console.log('FFmpeg loaded successfully (single-threaded fallback)')
      } catch (fallbackError) {
        console.error('Fallback FFmpeg loading failed:', fallbackError)
        throw new Error('Failed to load audio converter. Please try again or contact support if the issue persists.')
      }
    } finally {
      isLoadingFFmpeg.value = false
    }
  }
  const MAX_INPUT_SIZE = 100 * 1024 * 1024 // 100MB
  const CONVERSION_TIMEOUT = 5 * 60 * 1000 // 5 minutes

  const convertToMp3 = async (inputData: Uint8Array): Promise<Blob> => {
    console.log('Starting audio conversion, input size:', inputData.length)
    
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

      if (!ffmpeg.value.loaded) {
        throw new Error('FFmpeg not loaded properly')
      }

      console.log('FFmpeg initialized successfully, writing input file...')
      
      // Verify input data format before conversion
      const { isMP3, isM4A } = validateAudioFormat(inputData)
      
      console.log('Input format:', isMP3 ? 'MP3' : isM4A ? 'M4A' : 'Unknown')
      
      if (!isMP3 && !isM4A) {
        throw new Error('Unsupported input format - not MP3 or M4A')
      }
      
      await ffmpeg.value.writeFile('input.audio', inputData)
      console.log('Input file written successfully')
      
      console.log('Starting MP3 conversion...')
      
      // Get optimal thread count for this conversion
      const threadCount = getOptimalThreadCount()
      console.log(`Using ${threadCount} threads for conversion`)
      
      // Build FFmpeg command with performance settings
      const ffmpegArgs = [
        '-i', 'input.audio',
        '-acodec', 'libmp3lame',           // Explicitly set audio codec
        '-ar', '44100',                    // Set sample rate
        '-ac', '2',                        // Set to stereo
        '-ab', performanceSettings.audioQuality, // Use dynamic bitrate
        '-map', '0:a',                     // Only map audio stream
        '-f', 'mp3',                       // Force MP3 format
        '-preset', performanceSettings.compressionPreset, // Use dynamic preset
        '-y',                              // Overwrite output
        'output.mp3'
      ]

      // Add multi-threading if enabled
      if (performanceSettings.enableMultiThreading) {
        ffmpegArgs.splice(2, 0, '-threads', threadCount.toString())
      }

      console.log('FFmpeg command:', ffmpegArgs.join(' '))
      
      // Add timeout promise with multi-threading support
      const conversionPromise = ffmpeg.value.exec(ffmpegArgs)

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Conversion timeout (5 minutes)')), CONVERSION_TIMEOUT)
      })

      try {
        await Promise.race([conversionPromise, timeoutPromise])
        console.log('Conversion completed successfully')
      } catch (error: unknown) {
        console.error('Conversion error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        throw new Error(`Conversion failed: ${errorMessage}`)
      }
      
      console.log('Reading output file')
      const data = await ffmpeg.value.readFile('output.mp3')
      
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

      console.log('MP3 validation successful')
      return new Blob([data], { type: 'audio/mpeg' })

    } catch (error) {
      console.error('Error converting to MP3:', error)
      let errorMessage = 'Unknown error during conversion'
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Conversion took too long'
        } else if (error.message.includes('EBML')) {
          errorMessage = 'Invalid input format'
        } else if (error.message.includes('too large')) {
          errorMessage = 'File too large'
        } else {
          errorMessage = error.message
        }
      }
      
      throw new Error('Failed to convert audio: ' + errorMessage)
    } finally {
      // Cleanup with timeout
      try {
        if (ffmpeg.value) {
          await Promise.race([
            Promise.all([
              ffmpeg.value.deleteFile('input.audio'),
              ffmpeg.value.deleteFile('output.mp3')
            ]),
            new Promise(r => setTimeout(r, 5000)) // 5s timeout for cleanup
          ])
        }
      } catch (error) {
        console.warn('Cleanup error:', error)
      }
    }
  }

  return {
    isLoadingFFmpeg,
    convertToMp3
  }
}
