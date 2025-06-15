import { ref } from 'vue'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import type { FFmpegType } from '@/types'

export const useAudioProcessor = () => {
  const ffmpeg = ref<FFmpegType>()
  const isLoadingFFmpeg = ref(false)
  
  const initFFmpeg = async () => {
    if (ffmpeg.value?.loaded) {
      console.log('FFmpeg already loaded')
      return
    }
    
    try {
      isLoadingFFmpeg.value = true
      console.log('Starting FFmpeg initialization')
      
      // Create FFmpeg instance with proper CORS configuration
      ffmpeg.value = new FFmpeg()
      
      await ffmpeg.value.load()
      console.log('FFmpeg loaded successfully')
    } catch (error) {
      console.error('Error loading FFmpeg:', error)
      throw new Error('Failed to load audio converter. Please try again or contact support if the issue persists.')
    } finally {
      isLoadingFFmpeg.value = false
    }
  }
  const MAX_INPUT_SIZE = 100 * 1024 * 1024 // 100MB
  const CONVERSION_TIMEOUT = 5 * 60 * 1000 // 5 minutes

  const convertToMp3 = async (inputData: Uint8Array): Promise<Blob> => {
    console.log('Starting audio conversion')
    
    try {
      // Check input size
      if (inputData.length > MAX_INPUT_SIZE) {
        throw new Error('Input file too large (max 100MB)')
      }

      await initFFmpeg()
      
      if (!ffmpeg.value) {
        throw new Error('FFmpeg not initialized')
      }

      console.log('Writing input file')
      
      // Verify input data format before conversion
      const isMP3 = inputData[0] === 0xFF && (inputData[1] & 0xE0) === 0xE0
      const isM4A = (
        inputData[4] === 0x66 && // f
        inputData[5] === 0x74 && // t
        inputData[6] === 0x79 && // y
        inputData[7] === 0x70    // p
      )
      
      console.log('Input format:', isMP3 ? 'MP3' : isM4A ? 'M4A' : 'Unknown')
      
      await ffmpeg.value.writeFile('input.audio', inputData)
      
      console.log('Converting to MP3')
      
      // Add timeout promise
      const conversionPromise = ffmpeg.value.exec([
        '-i', 'input.audio',
        '-acodec', 'libmp3lame', // Explicitly set audio codec
        '-ar', '44100',          // Set sample rate
        '-ac', '2',              // Set to stereo
        '-ab', '320k',           // Set bitrate
        '-map', '0:a',           // Only map audio stream
        '-f', 'mp3',             // Force MP3 format
        '-y',                    // Overwrite output
        'output.mp3'
      ])

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
      }      console.log('Reading output file')
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
      
      // More thorough MP3 header verification
      const hasID3 = data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33 // "ID3"
      let offset = 0
      
      if (hasID3) {
        // Skip ID3v2 tag if present
        const id3Size = ((data[6] & 0x7f) << 21) | ((data[7] & 0x7f) << 14) | ((data[8] & 0x7f) << 7) | (data[9] & 0x7f)
        offset = id3Size + 10
        console.log('Found ID3v2 tag, skipping', offset, 'bytes')
      }
      
      // Check for MP3 sync word (0xFFF) after ID3 tag if present
      const isValidMp3 = (data[offset] === 0xFF && (data[offset + 1] & 0xE0) === 0xE0) || 
                        (data[offset] === 0xFF && data[offset + 1] === 0xFB)
      
      if (!isValidMp3) {
        console.error('Invalid MP3 header at offset', offset, ':', 
          Array.from(data.slice(offset, offset + 4)).map(b => b.toString(16).padStart(2, '0')).join(' '))
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
