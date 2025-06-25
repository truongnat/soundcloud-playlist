/**
 * Development server fix script for ECONNRESET issues
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Fixing Nuxt development server issues...\n')

// Step 1: Clear development caches
console.log('1. Clearing development caches...')
try {
  const cacheDirs = ['.nuxt', '.output', 'node_modules/.cache', 'node_modules/.vite']
  
  for (const dir of cacheDirs) {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath)) {
      console.log(`   Removing ${dir}...`)
      fs.rmSync(fullPath, { recursive: true, force: true })
    }
  }
  console.log('   ✅ Caches cleared\n')
} catch (error) {
  console.log('   ⚠️  Some cache directories could not be cleared:', error.message, '\n')
}

// Step 2: Check for port conflicts
console.log('2. Checking for port conflicts...')
try {
  // Check if port 3000 is in use
  const netstat = execSync('netstat -ano | findstr :3000', { encoding: 'utf8' }).trim()
  if (netstat) {
    console.log('   ⚠️  Port 3000 is in use:')
    console.log('   ' + netstat)
    console.log('   Consider killing the process or using a different port\n')
  } else {
    console.log('   ✅ Port 3000 is available\n')
  }
} catch (error) {
  console.log('   ✅ Port 3000 appears to be available\n')
}

// Step 3: Check Node.js version
console.log('3. Checking Node.js version...')
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim()
  const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0])
  
  console.log(`   Node.js version: ${nodeVersion}`)
  
  if (majorVersion < 18) {
    console.log('   ⚠️  Node.js 18+ is recommended for Nuxt 3')
    console.log('   Consider upgrading Node.js\n')
  } else {
    console.log('   ✅ Node.js version is compatible\n')
  }
} catch (error) {
  console.log('   ❌ Could not check Node.js version\n')
}

// Step 4: Create improved nuxt.config.ts
console.log('4. Creating improved development configuration...')
try {
  const configPath = path.join(process.cwd(), 'nuxt.config.ts')
  const backupPath = path.join(process.cwd(), 'nuxt.config.backup.ts')
  const fixedConfigPath = path.join(process.cwd(), 'nuxt.config.dev-fix.ts')
  
  // Backup current config
  if (fs.existsSync(configPath)) {
    fs.copyFileSync(configPath, backupPath)
    console.log('   📁 Backed up current config to nuxt.config.backup.ts')
  }
  
  // Copy fixed config
  if (fs.existsSync(fixedConfigPath)) {
    fs.copyFileSync(fixedConfigPath, configPath)
    console.log('   ✅ Applied improved development configuration\n')
  } else {
    console.log('   ❌ Fixed config file not found\n')
  }
} catch (error) {
  console.log('   ❌ Could not update configuration:', error.message, '\n')
}

// Step 5: Install/update dependencies
console.log('5. Checking dependencies...')
try {
  console.log('   Running npm install to ensure dependencies are up to date...')
  execSync('npm install', { stdio: 'inherit' })
  console.log('   ✅ Dependencies updated\n')
} catch (error) {
  console.log('   ⚠️  Could not update dependencies:', error.message, '\n')
}

// Step 6: Provide recommendations
console.log('6. Recommendations for stable development:')
console.log('   • Use "npm run dev" to start the development server')
console.log('   • If issues persist, try "npm run dev:fast" for faster startup')
console.log('   • Clear browser cache if you see stale content')
console.log('   • Restart your terminal/IDE if HMR stops working')
console.log('   • Check Windows Defender/antivirus isn\'t blocking file changes')
console.log('   • Ensure no other processes are using port 3000')

// Step 7: Create development troubleshooting script
console.log('\n7. Creating troubleshooting script...')
const troubleshootScript = `
@echo off
echo Troubleshooting Nuxt development server...
echo.

echo Killing any processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul

echo Clearing development caches...
if exist .nuxt rmdir /s /q .nuxt
if exist .output rmdir /s /q .output
if exist node_modules\\.cache rmdir /s /q node_modules\\.cache
if exist node_modules\\.vite rmdir /s /q node_modules\\.vite

echo Starting development server...
npm run dev

pause
`

try {
  fs.writeFileSync(path.join(process.cwd(), 'dev-troubleshoot.bat'), troubleshootScript)
  console.log('   ✅ Created dev-troubleshoot.bat for quick fixes')
} catch (error) {
  console.log('   ⚠️  Could not create troubleshooting script')
}

console.log('\n🎉 Development server fix complete!')
console.log('\nNext steps:')
console.log('1. Run "npm run dev" to start the development server')
console.log('2. If you still get ECONNRESET errors, run "dev-troubleshoot.bat"')
console.log('3. Check the browser console for any additional errors')
console.log('4. If issues persist, try restarting your computer')

console.log('\n📝 Common solutions for ECONNRESET in development:')
console.log('• Antivirus software blocking file changes')
console.log('• Windows Defender real-time protection')
console.log('• Network proxy or VPN interference')
console.log('• Insufficient system resources')
console.log('• Conflicting development servers')