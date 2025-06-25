#!/usr/bin/env node

import { execSync } from 'child_process'
import { statSync, readdirSync } from 'fs'
import { join } from 'path'
import { performance } from 'perf_hooks'

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getDirectorySize(dirPath) {
  let totalSize = 0
  try {
    const files = readdirSync(dirPath)
    for (const file of files) {
      const filePath = join(dirPath, file)
      const stats = statSync(filePath)
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(filePath)
      } else {
        totalSize += stats.size
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return totalSize
}

function analyzeBuild() {
  console.log('\n📊 Build Analysis Report')
  console.log('========================\n')
  
  // Analyze .nuxt directory
  const nuxtSize = getDirectorySize('.nuxt')
  console.log(`📁 .nuxt directory: ${formatBytes(nuxtSize)}`)
  
  // Analyze .output directory
  const outputSize = getDirectorySize('.output')
  console.log(`📦 .output directory: ${formatBytes(outputSize)}`)
  
  // Analyze node_modules
  const nodeModulesSize = getDirectorySize('node_modules')
  console.log(`📚 node_modules: ${formatBytes(nodeModulesSize)}`)
  
  // Check for large files in .output/public
  try {
    const publicFiles = readdirSync('.output/public/_nuxt')
    const largeFiles = []
    
    for (const file of publicFiles) {
      const filePath = join('.output/public/_nuxt', file)
      const stats = statSync(filePath)
      if (stats.size > 500 * 1024) { // Files larger than 500KB
        largeFiles.push({
          name: file,
          size: stats.size
        })
      }
    }
    
    if (largeFiles.length > 0) {
      console.log('\n⚠️  Large bundle files detected:')
      largeFiles
        .sort((a, b) => b.size - a.size)
        .forEach(file => {
          console.log(`   ${file.name}: ${formatBytes(file.size)}`)
        })
      
      console.log('\n💡 Consider code splitting or lazy loading for these files')
    }
    
  } catch (error) {
    console.log('ℹ️  Build output analysis not available')
  }
  
  console.log('\n🎯 Optimization Recommendations:')
  console.log('• Use npm run build:fast for faster builds')
  console.log('• Run npm run clean before builds to clear cache')
  console.log('• Consider lazy loading heavy components')
  console.log('• Use dynamic imports for large libraries')
  console.log('• Enable build caching with NUXT_BUILD_CACHE=true')
}

// Run build monitoring
const startTime = performance.now()

console.log('🔍 Monitoring build performance...')

try {
  // Run the build
  execSync('npm run build', { stdio: 'inherit' })
  
  const endTime = performance.now()
  const buildTime = Math.round((endTime - startTime) / 1000)
  
  console.log(`\n⏱️  Total build time: ${buildTime}s`)
  
  // Analyze the build
  analyzeBuild()
  
} catch (error) {
  console.error('❌ Build monitoring failed:', error.message)
  process.exit(1)
}