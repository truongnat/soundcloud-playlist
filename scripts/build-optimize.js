#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync, rmSync } from 'fs'
import { performance } from 'perf_hooks'

console.log('🚀 Starting optimized build process...\n')

const startTime = performance.now()

// Clean previous builds
console.log('🧹 Cleaning previous builds...')
if (existsSync('.nuxt')) {
  rmSync('.nuxt', { recursive: true, force: true })
}
if (existsSync('.output')) {
  rmSync('.output', { recursive: true, force: true })
}
if (existsSync('dist')) {
  rmSync('dist', { recursive: true, force: true })
}

// Set environment variables for optimal build
process.env.NODE_ENV = 'production'
process.env.NITRO_PRESET = 'static'
process.env.NUXT_TELEMETRY_DISABLED = '1'

// Build with optimizations
console.log('⚡ Building with optimizations...')
try {
  execSync('nuxt build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // Increase Node.js memory limit
      NODE_OPTIONS: '--max-old-space-size=4096',
      // Disable source maps in production
      GENERATE_SOURCEMAP: 'false',
      // Enable build cache
      NUXT_BUILD_CACHE: 'true'
    }
  })
  
  const endTime = performance.now()
  const buildTime = Math.round((endTime - startTime) / 1000)
  
  console.log(`\n✅ Build completed successfully in ${buildTime}s!`)
  console.log('📦 Build artifacts are ready in .output directory')
  
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}