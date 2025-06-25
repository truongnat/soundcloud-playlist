# Connection Reset (ECONNRESET) Fix Documentation

## Problem Description

The application was experiencing `ECONNRESET` errors when communicating with external APIs, particularly SoundCloud's API. This error occurs when the remote server unexpectedly closes the connection, often due to:

- Network instability
- Server-side connection limits
- Rate limiting
- Timeout issues
- Load balancing changes

## Solutions Implemented

### 1. Enhanced Retry Logic (`utils/api.ts`)

- **Improved `fetchWithRetry` function** with better error handling
- **Connection-specific error detection** and longer delays for connection issues
- **Timeout handling** with AbortController (15-second timeout)
- **Enhanced headers** including User-Agent and Connection: keep-alive
- **Exponential backoff** with jitter for connection errors

### 2. Connection Handler Utility (`utils/connection-handler.ts`)

- **`withConnectionRetry` function** for wrapping operations with retry logic
- **Connection error detection** for various error types (ECONNRESET, ETIMEDOUT, etc.)
- **Configurable retry options** (maxRetries, baseDelay, timeout)
- **Pre-configured fetch functions** for different use cases
- **Circuit breaker pattern** support

### 3. Improved SoundCloud Utilities (`utils/soundcloud.ts`)

- **Enhanced `getStreamUrl` function** with connection retry logic
- **Better timeout handling** (10-second timeout per attempt)
- **Connection-aware retry delays** (longer delays for connection errors)
- **Proper error categorization** and logging

### 4. Server-Side Improvements (`server/utils/soundcloud.ts`)

- **Enhanced client ID validation** with retry logic
- **Connection timeout handling** (8-second timeout)
- **Better error logging** and categorization
- **Retry logic for connection errors** during validation

### 5. Error Monitoring (`utils/error-monitor.ts`)

- **Error statistics tracking** (total, connection, timeout, rate limit errors)
- **Error history** with timestamps and context
- **Connection error rate calculation** for adaptive behavior
- **Backoff recommendations** based on error patterns
- **Comprehensive error categorization**

### 6. Connection Configuration (`utils/connection-config.ts`)

- **Configurable connection settings** for different contexts
- **Context-specific configurations** (streaming, background, validation)
- **Adaptive delay calculation** with exponential backoff and jitter
- **Error-specific retry conditions**

### 7. Health Monitoring (`server/api/health.ts`)

- **Enhanced health endpoint** with error statistics
- **Connection status monitoring**
- **Backoff recommendations** in health responses
- **System degradation detection**

### 8. Diagnostic Tools (`scripts/diagnose-connections.js`)

- **Connection testing script** for troubleshooting
- **Stability testing** with multiple rapid requests
- **Error pattern analysis**
- **Performance metrics** and recommendations

## Usage Examples

### Basic Retry with Connection Handling

```typescript
import { withConnectionRetry } from '~/utils/connection-handler'

const result = await withConnectionRetry(async () => {
  return await fetch('https://api.example.com/data')
}, {
  maxRetries: 3,
  baseDelay: 1000,
  timeout: 15000
})
```

### Using Pre-configured Fetch

```typescript
import { soundcloudFetch } from '~/utils/connection-handler'

const response = await soundcloudFetch('https://api-v2.soundcloud.com/tracks/123', {
  headers: { 'Authorization': 'Bearer token' }
})
```

### Error Monitoring

```typescript
import { logError, getErrorStats, shouldBackoff } from '~/utils/error-monitor'

try {
  // Your API call
} catch (error) {
  logError(error, 'SoundCloud API call')
  
  if (shouldBackoff()) {
    // Implement backoff strategy
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
}
```

## Configuration Options

### Connection Retry Options

- `maxRetries`: Maximum number of retry attempts (default: 3)
- `baseDelay`: Base delay between retries in ms (default: 1000)
- `maxDelay`: Maximum delay cap in ms (default: 10000)
- `timeout`: Request timeout in ms (default: 15000)
- `retryCondition`: Function to determine if error should be retried

### Context-Specific Configurations

- **Default**: General API calls (3 retries, 1s base delay)
- **Streaming**: High-priority streaming requests (4 retries, 1.5s base delay)
- **Background**: Background tasks (5 retries, 2s base delay)
- **Validation**: Client ID validation (2 retries, 800ms base delay)

## Monitoring and Diagnostics

### Health Check Endpoint

Visit `/api/health` to see:
- Current error statistics
- Connection error rates
- System status (ok/degraded)
- Backoff recommendations

### Running Diagnostics

```bash
node scripts/diagnose-connections.js
```

This will test:
- Basic connectivity to SoundCloud endpoints
- Connection stability with rapid requests
- Error pattern analysis
- Performance metrics
- Recommendations based on results

## Best Practices

1. **Always use retry logic** for external API calls
2. **Monitor error rates** and implement backoff when needed
3. **Use appropriate timeouts** (not too short, not too long)
4. **Log errors with context** for better debugging
5. **Implement circuit breaker patterns** for high error rates
6. **Use connection pooling** when possible
7. **Add jitter to retry delays** to prevent thundering herd

## Troubleshooting

### High Connection Error Rate

1. Check network connectivity
2. Verify SoundCloud API status
3. Implement longer delays between requests
4. Consider using different client IDs
5. Check for rate limiting

### Persistent Timeouts

1. Increase timeout values
2. Check DNS resolution
3. Verify firewall settings
4. Consider using different endpoints

### Rate Limiting Issues

1. Implement exponential backoff
2. Reduce request frequency
3. Use multiple client IDs
4. Cache responses when possible

## Files Modified/Created

### Modified Files
- `utils/api.ts` - Enhanced retry logic
- `utils/soundcloud.ts` - Improved stream URL handling
- `server/utils/soundcloud.ts` - Better client ID validation
- `server/api/health.ts` - Added error monitoring

### New Files
- `utils/connection-handler.ts` - Connection retry utilities
- `utils/error-monitor.ts` - Error tracking and monitoring
- `utils/connection-config.ts` - Configuration management
- `scripts/diagnose-connections.js` - Diagnostic tools
- `server/api/stream-mp3-improved.ts` - Improved streaming endpoint

## Testing

To test the improvements:

1. Run the diagnostic script: `node scripts/diagnose-connections.js`
2. Check health endpoint: `curl http://localhost:3000/api/health`
3. Monitor error logs for connection issues
4. Test with high-frequency requests to verify retry logic

The implemented solutions should significantly reduce ECONNRESET errors and improve the overall reliability of your SoundCloud playlist application.