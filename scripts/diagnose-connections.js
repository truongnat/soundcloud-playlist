/**
 * Connection diagnostic script to help identify ECONNRESET issues
 */

const https = require('https')
const http = require('http')

const SOUNDCLOUD_ENDPOINTS = [
  'https://api-v2.soundcloud.com',
  'https://soundcloud.com',
  'https://a-v2.sndcdn.com'
]

async function testConnection(url) {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const urlObj = new URL(url)
    const client = urlObj.protocol === 'https:' ? https : http
    
    const req = client.request({
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: '/',
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      const duration = Date.now() - startTime
      resolve({
        url,
        success: true,
        status: res.statusCode,
        duration,
        headers: res.headers
      })
    })
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime
      resolve({
        url,
        success: false,
        error: error.message,
        code: error.code,
        duration
      })
    })
    
    req.on('timeout', () => {
      req.destroy()
      const duration = Date.now() - startTime
      resolve({
        url,
        success: false,
        error: 'Request timeout',
        code: 'ETIMEDOUT',
        duration
      })
    })
    
    req.end()
  })
}

async function runDiagnostics() {
  console.log('🔍 Running connection diagnostics...\n')
  
  // Test basic connectivity
  console.log('📡 Testing basic connectivity to SoundCloud endpoints:')
  for (const endpoint of SOUNDCLOUD_ENDPOINTS) {
    const result = await testConnection(endpoint)
    
    if (result.success) {
      console.log(`✅ ${endpoint} - Status: ${result.status}, Duration: ${result.duration}ms`)
    } else {
      console.log(`❌ ${endpoint} - Error: ${result.error} (${result.code}), Duration: ${result.duration}ms`)
    }
  }
  
  console.log('\n🔄 Testing connection stability (5 rapid requests):')
  
  // Test connection stability
  const stabilityTests = []
  for (let i = 0; i < 5; i++) {
    stabilityTests.push(testConnection('https://api-v2.soundcloud.com'))
  }
  
  const results = await Promise.all(stabilityTests)
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const connectionResets = results.filter(r => r.code === 'ECONNRESET').length
  
  console.log(`📊 Results: ${successful}/5 successful, ${failed}/5 failed`)
  if (connectionResets > 0) {
    console.log(`⚠️  ${connectionResets} connection resets detected!`)
  }
  
  // Analyze error patterns
  const errors = results.filter(r => !r.success)
  if (errors.length > 0) {
    console.log('\n🔍 Error analysis:')
    const errorCounts = {}
    errors.forEach(error => {
      errorCounts[error.code] = (errorCounts[error.code] || 0) + 1
    })
    
    Object.entries(errorCounts).forEach(([code, count]) => {
      console.log(`  ${code}: ${count} occurrences`)
    })
  }
  
  // Performance analysis
  const durations = results.filter(r => r.success).map(r => r.duration)
  if (durations.length > 0) {
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const maxDuration = Math.max(...durations)
    const minDuration = Math.min(...durations)
    
    console.log('\n⏱️  Performance analysis:')
    console.log(`  Average response time: ${avgDuration.toFixed(2)}ms`)
    console.log(`  Min response time: ${minDuration}ms`)
    console.log(`  Max response time: ${maxDuration}ms`)
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:')
  
  if (connectionResets > 0) {
    console.log('  - Connection resets detected. Consider:')
    console.log('    • Implementing exponential backoff with jitter')
    console.log('    • Adding connection pooling')
    console.log('    • Increasing timeout values')
    console.log('    • Using keep-alive connections')
  }
  
  if (failed > successful) {
    console.log('  - High failure rate detected. Consider:')
    console.log('    • Checking network connectivity')
    console.log('    • Implementing circuit breaker pattern')
    console.log('    • Adding health checks')
  }
  
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
  if (avgDuration > 3000) {
    console.log('  - Slow response times detected. Consider:')
    console.log('    • Reducing timeout values')
    console.log('    • Implementing request caching')
    console.log('    • Using CDN or edge locations')
  }
  
  console.log('\n✅ Diagnostics complete!')
}

// Run diagnostics if called directly
if (require.main === module) {
  runDiagnostics().catch(console.error)
}

module.exports = { runDiagnostics, testConnection }