# Development Server ECONNRESET Fix Guide

## Problem Description

You're experiencing `ECONNRESET` errors when Nuxt tries to dynamically import modules like `pages/index.vue` during development. This typically manifests as:

```
ERROR [unhandledRejection] read ECONNRESET
Failed to fetch dynamically imported module: http://localhost:3000/_nuxt/pages/index.vue
```

## Root Causes

This issue commonly occurs due to:

1. **Hot Module Replacement (HMR) conflicts**
2. **Port conflicts or blocked connections**
3. **Antivirus/Windows Defender interference**
4. **Development cache corruption**
5. **Network proxy/VPN interference**
6. **Insufficient system resources**

## Quick Fixes

### Option 1: Use the Automated Fix Script

```bash
npm run fix-dev
```

This will automatically:
- Clear all development caches
- Check for port conflicts
- Update your Nuxt configuration
- Install/update dependencies

### Option 2: Use the Restart Script

Double-click `dev-restart.bat` or run:
```bash
./dev-restart.bat
```

### Option 3: Manual Steps

1. **Stop the development server** (Ctrl+C)

2. **Clear caches:**
   ```bash
   npm run clean:all
   ```

3. **Kill any processes on port 3000:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /f /pid [PID_NUMBER]
   
   # Or use PowerShell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
   ```

4. **Restart the development server:**
   ```bash
   npm run dev:clean
   ```

## Alternative Development Commands

If the standard `npm run dev` continues to have issues, try these alternatives:

```bash
# Faster startup, no forking
npm run dev:fast

# Clean start (clears cache first)
npm run dev:clean

# Debug mode
npm run dev:debug

# Host on all interfaces
npm run dev:host
```

## Configuration Improvements

The fix includes an improved `nuxt.config.ts` with:

- **Better HMR configuration** with dedicated ports
- **Enhanced file watching** with polling for Windows
- **Improved error handling** in development
- **CORS headers** for better local development
- **Optimized caching** strategies

Key improvements:
```typescript
vite: {
  server: {
    hmr: {
      port: 24678,
      clientPort: 24678,
      overlay: false
    },
    watch: {
      usePolling: process.env.NODE_ENV === 'development',
      interval: 1000,
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    cors: true
  }
}
```

## System-Level Fixes

### Windows Defender/Antivirus

1. **Add exclusions** for your project directory:
   - Open Windows Security
   - Go to Virus & threat protection
   - Add exclusion for your project folder

2. **Disable real-time protection** temporarily during development

### Network Issues

1. **Disable VPN** during development
2. **Check proxy settings** in your browser/system
3. **Flush DNS cache:**
   ```bash
   ipconfig /flushdns
   ```

### System Resources

1. **Close unnecessary applications**
2. **Increase Node.js memory limit:**
   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096
   npm run dev
   ```

## Troubleshooting Steps

### Step 1: Check Node.js Version
```bash
node --version
```
Ensure you're using Node.js 18+ for best Nuxt 3 compatibility.

### Step 2: Check Port Usage
```bash
netstat -ano | findstr :3000
```

### Step 3: Test Basic Connectivity
```bash
curl http://localhost:3000
```

### Step 4: Check Browser Console
Open browser dev tools and look for:
- Network errors
- Console errors
- Failed resource loads

### Step 5: Test in Different Browser
Try opening the app in:
- Chrome (incognito mode)
- Firefox
- Edge

## Advanced Solutions

### Use Different Port
If port 3000 is problematic, modify your `nuxt.config.ts`:

```typescript
devServer: {
  port: 3001,
  host: 'localhost'
}
```

### Disable HMR Temporarily
Add to your `nuxt.config.ts`:

```typescript
vite: {
  server: {
    hmr: false
  }
}
```

### Use Polling for File Watching
Already included in the fix, but you can adjust the interval:

```typescript
vite: {
  server: {
    watch: {
      usePolling: true,
      interval: 2000  // Increase if needed
    }
  }
}
```

## Prevention Tips

1. **Regular cache clearing:** Run `npm run clean` weekly
2. **Keep dependencies updated:** Run `npm update` regularly
3. **Restart development server** after major changes
4. **Monitor system resources** during development
5. **Use consistent Node.js version** across team

## If Issues Persist

1. **Restart your computer** - Sometimes Windows needs a full restart
2. **Reinstall Node.js** - Download latest LTS version
3. **Clear npm cache:** `npm cache clean --force`
4. **Delete node_modules:** `rm -rf node_modules && npm install`
5. **Check Windows Event Viewer** for system-level errors

## Getting Help

If you continue to experience issues:

1. Check the browser console for specific error messages
2. Look at the terminal output for detailed error logs
3. Try the development server on a different machine
4. Consider using WSL2 if on Windows for better Node.js compatibility

## Files Created/Modified

- `nuxt.config.dev-fix.ts` - Improved configuration
- `scripts/fix-dev-server.js` - Automated fix script
- `dev-restart.bat` - Quick restart script
- `package.json` - Added helpful development scripts

## Success Indicators

You'll know the fix worked when:
- ✅ Development server starts without errors
- ✅ Pages load correctly in the browser
- ✅ Hot reload works when you make changes
- ✅ No ECONNRESET errors in the console
- ✅ Dynamic imports work properly