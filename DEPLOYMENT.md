# Netlify Deployment Guide

## Issues Fixed

The 502 error when calling the playlist API on Netlify was caused by several serverless environment limitations:

1. **Function Timeout**: Netlify functions have a 10-second timeout (free) or 26-second timeout (paid)
2. **Memory Limits**: Limited memory allocation for serverless functions
3. **External API Dependencies**: Multiple SoundCloud API calls causing delays
4. **Network Restrictions**: Different network behavior in serverless vs local environment

## Changes Made

### 1. Optimized Playlist API (`server/api/playlist.ts`)
- Added 25-second timeout wrapper for Netlify compatibility
- Reduced retry attempts from 5 to 2
- Limited playlist processing to 50 tracks maximum
- Removed stream URL fetching from initial request (moved to separate endpoint)
- Reduced batch sizes and delays for faster processing

### 2. New Stream URL Endpoint (`server/api/stream-url.ts`)
- Separate endpoint for fetching stream URLs on-demand
- 8-second timeout per request
- Optimized for single track processing

### 3. Improved SoundCloud Utils (`server/utils/soundcloud.ts`)
- Added request timeouts (8 seconds for main page, 5 seconds per script)
- Reduced client ID validity period to 15 minutes
- Limited script parsing to 2 files maximum
- Added AbortController for timeout handling

### 4. Netlify Configuration (`netlify.toml`)
- Increased function timeout to 26 seconds
- Increased memory allocation to 1024MB
- Added proper redirects for API routes
- Optimized build settings

### 5. Nuxt Configuration Updates (`nuxt.config.ts`)
- Added Netlify preset
- Enabled compression
- Added CORS headers for API routes
- Optimized for serverless deployment

## Deployment Steps

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.output/public`
   - Set functions directory: `.output/server`

3. **Environment Variables (if needed):**
   - No additional environment variables required
   - The app uses dynamic client ID fetching

## Testing the Deployment

1. **Health Check:**
   ```
   GET https://your-app.netlify.app/api/health
   ```

2. **Playlist API:**
   ```
   GET https://your-app.netlify.app/api/playlist?url=SOUNDCLOUD_PLAYLIST_URL
   ```

3. **Stream URL API:**
   ```
   GET https://your-app.netlify.app/api/stream-url?trackId=TRACK_ID
   ```

## Troubleshooting

### Still Getting 502 Errors?

1. **Check Function Logs:**
   - Go to Netlify Dashboard → Functions → View logs
   - Look for timeout or memory errors

2. **Test with Smaller Playlists:**
   - Try playlists with fewer than 20 tracks first
   - Large playlists may still timeout

3. **Check SoundCloud API Status:**
   - Test the health endpoint first
   - SoundCloud may be blocking requests

### Performance Issues?

1. **Upgrade Netlify Plan:**
   - Free tier: 10-second timeout
   - Paid tier: 26-second timeout, more memory

2. **Use Pagination:**
   - The API now limits to 50 tracks
   - Consider implementing pagination for larger playlists

3. **Cache Client IDs:**
   - Client IDs are cached for 15 minutes
   - Consider using environment variables for static client IDs

### Client-Side Changes Needed

If you're using the stream URLs in your frontend, update your code to:

1. **Fetch stream URLs on-demand:**
   ```javascript
   async function getStreamUrl(trackId) {
     const response = await fetch(`/api/stream-url?trackId=${trackId}`)
     const data = await response.json()
     return data.streamUrl
   }
   ```

2. **Handle loading states:**
   - Show loading indicators while fetching stream URLs
   - Cache stream URLs once fetched

3. **Error handling:**
   - Handle cases where stream URLs can't be fetched
   - Provide fallback to SoundCloud permalink

## Monitoring

- Monitor function execution time in Netlify dashboard
- Check for 502/504 errors in logs
- Monitor SoundCloud API rate limits

The deployment should now work much more reliably on Netlify with these optimizations!