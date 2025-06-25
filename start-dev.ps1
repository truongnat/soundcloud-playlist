# PowerShell script to start Nuxt dev server with ECONNRESET fix
Write-Host "🚀 Starting Nuxt development server with ECONNRESET fix..." -ForegroundColor Green
Write-Host ""

# Kill existing processes on port 3000
Write-Host "🔄 Killing existing processes on port 3000..." -ForegroundColor Yellow
try {
    $processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($process in $processes) {
            $pid = $process.OwningProcess
            Write-Host "   Killing process $pid" -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "   No processes found on port 3000" -ForegroundColor Green
    }
} catch {
    Write-Host "   Port 3000 is available" -ForegroundColor Green
}

# Clear development caches
Write-Host "🧹 Clearing development caches..." -ForegroundColor Yellow
$cacheDirs = @(".nuxt", ".output", "node_modules\.cache", "node_modules\.vite")
foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Write-Host "   Removing $dir..." -ForegroundColor Red
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "   ✅ Caches cleared" -ForegroundColor Green

# Set environment variables
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:NUXT_HOST = "127.0.0.1"
$env:NUXT_PORT = "3000"

# Wait a moment
Write-Host "⏳ Waiting 2 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Start development server
Write-Host "🌐 Starting development server..." -ForegroundColor Green
Write-Host "   Open your browser to: http://127.0.0.1:3000" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm run dev