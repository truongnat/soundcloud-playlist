
@echo off
echo Troubleshooting Nuxt development server...
echo.

echo Killing any processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul

echo Clearing development caches...
if exist .nuxt rmdir /s /q .nuxt
if exist .output rmdir /s /q .output
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo Starting development server...
npm run dev

pause
