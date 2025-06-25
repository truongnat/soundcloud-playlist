@echo off
echo Starting Nuxt development server with ECONNRESET fix...
echo.

REM Kill any existing processes on port 3000
echo Killing existing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Killing process %%a
    taskkill /f /pid %%a 2>nul
)

REM Clear all caches
echo Clearing development caches...
if exist .nuxt rmdir /s /q .nuxt
if exist .output rmdir /s /q .output
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist node_modules\.vite rmdir /s /q node_modules\.vite

REM Set environment variables for better stability
set NODE_OPTIONS=--max-old-space-size=4096
set NUXT_HOST=127.0.0.1
set NUXT_PORT=3000

REM Wait a moment
timeout /t 2 /nobreak >nul

echo Starting development server...
echo Open your browser to: http://127.0.0.1:3000
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause