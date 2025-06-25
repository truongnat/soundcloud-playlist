#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync, rmSync } from 'fs'
import { performance } from 'perf_hooks'

console.log('🧪 Testing Build Performance\n')

// Test configurations
const tests = [
  {
    name: 'Standard Build',
    command: 'npm run build',
    env: {}
  },
  {
    name: 'Optimized Build',
    command: 'npm run build:fast',
    env: {
      NODE_OPTIONS: '--max-old-space-size=4096',
      NUXT_BUILD_CACHE: 'true',
      GENERATE_SOURCEMAP: 'false'
    }
  }
]

async function runTest(test) {
  console.log(`🔄 Running: ${test.name}`)
  
  // Clean before each test
  if (existsSync('.nuxt')) rmSync('.nuxt', { recursive: true, force: true })
  if (existsSync('.output')) rmSync('.output', { recursive: true, force: true })
  
  const startTime = performance.now()
  
  try {
    execSync(test.command, {
      stdio: 'pipe',
      env: { ...process.env, ...test.env }
    })
    
    const endTime = performance.now()
    const duration = Math.round((endTime - startTime) / 1000)
    
    console.log(`✅ ${test.name}: ${duration}s\n`)
    return { name: test.name, duration, success: true }
    
  } catch (error) {
    console.log(`❌ ${test.name}: Failed\n`)
    return { name: test.name, duration: 0, success: false }
  }
}

async function main() {
  const results = []
  
  for (const test of tests) {
    const result = await runTest(test)
    results.push(result)
  }
  
  // Display results
  console.log('📊 Performance Test Results')
  console.log('============================')
  
  results.forEach(result => {
    if (result.success) {
      console.log(`${result.name}: ${result.duration}s`)
    } else {
      console.log(`${result.name}: Failed`)
    }
  })
  
  // Calculate improvement
  const standard = results.find(r => r.name === 'Standard Build')
  const optimized = results.find(r => r.name === 'Optimized Build')
  
  if (standard?.success && optimized?.success) {
    const improvement = Math.round(((standard.duration - optimized.duration) / standard.duration) * 100)
    console.log(`\n🚀 Optimization Result: ${improvement}% faster!`)
    
    if (improvement > 50) {
      console.log('🎉 Excellent optimization!')
    } else if (improvement > 25) {
      console.log('👍 Good optimization!')
    } else {
      console.log('💡 Consider additional optimizations')
    }
  }
}

main().catch(console.error)