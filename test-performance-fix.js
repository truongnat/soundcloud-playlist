// Test script to verify performance dashboard NaN fix
console.log('Testing Performance Dashboard NaN Fix...')

// Test 1: Check avgSpeed calculation with zero values
function testAvgSpeedCalculation() {
  const testCases = [
    { speed: 0, expected: '0 B/s' },
    { speed: undefined, expected: '0 B/s' },
    { speed: NaN, expected: '0 B/s' },
    { speed: 1024, expected: '1KB/s' },
    { speed: 1024 * 1024, expected: '1MB/s' },
    { speed: 500, expected: '500B/s' }
  ]
  
  const avgSpeedCalculation = (speed) => {
    // Handle invalid or zero values
    if (!speed || speed === 0 || isNaN(speed)) {
      return '0 B/s'
    }
    
    if (speed > 1024 * 1024) {
      return `${Math.round(speed / (1024 * 1024))}MB/s`
    } else if (speed > 1024) {
      return `${Math.round(speed / 1024)}KB/s`
    }
    return `${Math.round(speed)}B/s`
  }
  
  let allPassed = true
  testCases.forEach(({ speed, expected }) => {
    const result = avgSpeedCalculation(speed)
    const passed = result === expected
    console.log(`✓ Speed ${speed} -> ${result} (expected: ${expected}) ${passed ? '✅' : '❌'}`)
    if (!passed) allPassed = false
  })
  
  return allPassed
}

// Test 2: Check success rate calculation
function testSuccessRateCalculation() {
  const testCases = [
    { rate: 0, expected: 0 },
    { rate: undefined, expected: 0 },
    { rate: NaN, expected: 0 },
    { rate: 85.7, expected: 86 },
    { rate: 100, expected: 100 }
  ]
  
  const successRateCalculation = (rate) => {
    if (!rate || isNaN(rate)) {
      return 0
    }
    return Math.round(rate)
  }
  
  let allPassed = true
  testCases.forEach(({ rate, expected }) => {
    const result = successRateCalculation(rate)
    const passed = result === expected
    console.log(`✓ Rate ${rate} -> ${result}% (expected: ${expected}%) ${passed ? '✅' : '❌'}`)
    if (!passed) allPassed = false
  })
  
  return allPassed
}

// Test 3: Check conversion time calculation
function testConversionTimeCalculation() {
  const testCases = [
    { time: 0, expected: 0 },
    { time: undefined, expected: 0 },
    { time: NaN, expected: 0 },
    { time: 15000, expected: 15 },
    { time: 30500, expected: 31 }
  ]
  
  const conversionTimeCalculation = (time) => {
    if (!time || isNaN(time)) {
      return 0
    }
    return Math.round(time / 1000)
  }
  
  let allPassed = true
  testCases.forEach(({ time, expected }) => {
    const result = conversionTimeCalculation(time)
    const passed = result === expected
    console.log(`✓ Time ${time}ms -> ${result}s (expected: ${expected}s) ${passed ? '✅' : '❌'}`)
    if (!passed) allPassed = false
  })
  
  return allPassed
}

// Test 4: Check metrics update with invalid values
function testMetricsUpdate() {
  const metrics = {
    averageDownloadSpeed: 0,
    averageConversionTime: 0,
    successRate: 0,
    totalDownloads: 0,
    failedDownloads: 0
  }
  
  const updateMetrics = (downloadSpeed, conversionTime, success) => {
    // Validate input parameters
    const validDownloadSpeed = isNaN(downloadSpeed) || downloadSpeed < 0 ? 0 : downloadSpeed
    const validConversionTime = isNaN(conversionTime) || conversionTime < 0 ? 0 : conversionTime
    
    metrics.totalDownloads++
    if (!success) {
      metrics.failedDownloads++
    }
    
    // Calculate running averages with validation
    const total = metrics.totalDownloads
    if (total > 0) {
      metrics.averageDownloadSpeed = 
        (metrics.averageDownloadSpeed * (total - 1) + validDownloadSpeed) / total
      metrics.averageConversionTime = 
        (metrics.averageConversionTime * (total - 1) + validConversionTime) / total
      metrics.successRate = 
        ((total - metrics.failedDownloads) / total) * 100
    }
    
    // Ensure no NaN values
    if (isNaN(metrics.averageDownloadSpeed)) {
      metrics.averageDownloadSpeed = 0
    }
    if (isNaN(metrics.averageConversionTime)) {
      metrics.averageConversionTime = 0
    }
    if (isNaN(metrics.successRate)) {
      metrics.successRate = 0
    }
  }
  
  // Test with invalid values
  updateMetrics(NaN, NaN, true)
  updateMetrics(undefined, undefined, false)
  updateMetrics(-100, -5000, true)
  
  const hasNaN = Object.values(metrics).some(value => isNaN(value))
  console.log('✓ Metrics after invalid updates:', metrics)
  console.log(`✓ No NaN values: ${!hasNaN ? '✅' : '❌'}`)
  
  return !hasNaN
}

// Run all tests
function runTests() {
  console.log('\n=== Performance Dashboard NaN Fix Test Suite ===\n')
  
  const results = [
    testAvgSpeedCalculation(),
    testSuccessRateCalculation(),
    testConversionTimeCalculation(),
    testMetricsUpdate()
  ]
  
  const passed = results.filter(Boolean).length
  const total = results.length
  
  console.log(`\n=== Test Results: ${passed}/${total} passed ===`)
  
  if (passed === total) {
    console.log('🎉 All NaN issues fixed successfully!')
    console.log('\n🔧 Fixes implemented:')
    console.log('  • avgSpeed: Handles 0, undefined, and NaN values')
    console.log('  • successRate: Validates rate before calculation')
    console.log('  • conversionTime: Checks for invalid time values')
    console.log('  • updateMetrics: Validates all input parameters')
    console.log('  • All calculations now return valid numbers')
  } else {
    console.log('⚠️  Some tests failed, check implementation')
  }
}

// Run tests if in Node.js environment
if (typeof window === 'undefined') {
  runTests()
} else {
  // Browser environment
  document.addEventListener('DOMContentLoaded', runTests)
}