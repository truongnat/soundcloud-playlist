@echo off
echo Building Nuxt app with Windows compatibility fixes...
echo.

REM Clear build caches
echo Clearing build caches...
if exist .nuxt rmdir /s /q .nuxt
if exist .output rmdir /s /q .output
if exist dist rmdir /s /q dist
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist node_modules\.vite rmdir /s /q node_modules\.vite

REM Set environment variables for better build compatibility
set NODE_OPTIONS=--max-old-space-size=8192
set NITRO_PRESET=node-server

REM Wait a moment
timeout /t 2 /nobreak >nul

echo Starting build process...
echo.

npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Build completed successfully!
    echo Output directory: .output
) else (
    echo.
    echo ❌ Build failed with error code %ERRORLEVEL%
    echo Try running: npm run build:simple
)

pause