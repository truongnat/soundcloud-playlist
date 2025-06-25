@echo off
echo Restarting Nuxt development server...
echo.

echo Step 1: Killing any processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Killing process %%a
    taskkill /f /pid %%a 2>nul
)

echo.
echo Step 2: Clearing development caches...
if exist .nuxt (
    echo Removing .nuxt directory...
    rmdir /s /q .nuxt
)
if exist .output (
    echo Removing .output directory...
    rmdir /s /q .output
)
if exist node_modules\.cache (
    echo Removing node_modules\.cache...
    rmdir /s /q node_modules\.cache
)
if exist node_modules\.vite (
    echo Removing node_modules\.vite...
    rmdir /s /q node_modules\.vite
)

echo.
echo Step 3: Starting development server...
echo Press Ctrl+C to stop the server
echo.
npm run dev

pause