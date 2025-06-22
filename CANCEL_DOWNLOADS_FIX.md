# Fix: Cancel Downloads When Replacing Playlist

## Vấn đề đã sửa:

Trước đây khi user confirm "Load New Playlist", hệ thống chỉ clear UI state nhưng không cancel các downloads đang chạy trong queue. Downloads vẫn tiếp tục chạy ngầm.

## Giải pháp:

### 1. **Expose discardAll từ DownloadQueue component**
```typescript
// DownloadQueue.vue
defineExpose({
  addToQueue,
  startAllDownloads,
  discardAll: handleDiscardAll  // ← Thêm này
})

// handleDiscardAll now calls the composable discardAll function
const handleDiscardAll = () => {
  discardAll() // Call the composable function to cancel active downloads
  emit('discard-all')
}
```

### 2. **Thêm discardAllDownloads function trong layout**
```typescript
// layouts/default.vue
const discardAllDownloads = async () => {
  try {
    console.log('Discarding all downloads from layout...')
    
    // Call discard on the download queue component
    if (downloadQueueRef.value?.discardAll) {
      await downloadQueueRef.value.discardAll()
    } else {
      // Fallback: call the store directly
      downloadQueueStore.discardAll()
    }
    
    // Clear local state
    handleDiscardAll()
    
    console.log('All downloads discarded successfully')
  } catch (error) {
    console.error('Error discarding downloads:', error)
  }
}

// Provide to child components
provide('discardAllDownloads', discardAllDownloads)
```

### 3. **Cập nhật clearCurrentPlaylist để cancel downloads**
```typescript
// pages/index.vue
async function clearCurrentPlaylist() {
  // First discard all active downloads
  if (downloadingTracks.value.length > 0) {
    console.log('Discarding active downloads before clearing playlist...')
    await discardAllDownloads()
  }
  
  // Then clear playlist state
  tracks.value = []
  playlistInfo.value = null
  error.value = ''
  currentJob.value = null
  
  logger.logUserAction('Cleared current playlist and cancelled downloads for new playlist')
}
```

### 4. **Thêm loading state khi replace**
```typescript
async function handleConfirmReplace() {
  showConfirmModal.value = false
  
  if (pendingFetchData.value) {
    // Show loading state while clearing
    loading.value = true
    
    try {
      // Clear current state (this will also cancel downloads)
      await clearCurrentPlaylist()
      
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Proceed with fetch
      proceedWithFetch(pendingFetchData.value.url, pendingFetchData.value.useBackground)
    } catch (error) {
      console.error('Error during playlist replacement:', error)
      error.value = 'Failed to clear current playlist'
    } finally {
      loading.value = false
    }
  }
}
```

## Cách hoạt động:

### Trước (Bug):
1. User có downloads đang chạy
2. User nhập playlist mới → Modal confirm
3. User click "Load New Playlist"
4. ❌ UI clear nhưng downloads vẫn chạy ngầm
5. ❌ Download queue vẫn hiển thị các downloads cũ

### Sau (Fixed):
1. User có downloads đang chạy
2. User nhập playlist mới → Modal confirm
3. User click "Load New Playlist"
4. ✅ Hiển thị loading state
5. ✅ Cancel tất cả downloads đang chạy (abort controllers)
6. ✅ Clear download queue
7. ✅ Clear UI state
8. ✅ Load playlist mới

## Cách test:

### Test Case 1: Downloads đang chạy
1. Load playlist A
2. Bắt đầu download 3-4 tracks
3. Nhập playlist B URL
4. Click "Load New Playlist" trong modal
5. ✅ **Expect**: Download queue clear hoàn toàn, không còn tracks cũ

### Test Case 2: Downloads completed
1. Load playlist A
2. Download hoàn thành một số tracks
3. Nhập playlist B URL
4. Click "Replace"
5. ✅ **Expect**: Queue clear, chỉ hiển thị tracks từ playlist B

### Test Case 3: Mixed state
1. Load playlist A
2. Một số tracks completed, một số đang download
3. Nhập playlist B URL
4. Click "Load New Playlist"
5. ✅ **Expect**: Tất cả clear, chỉ playlist B

## Technical Details:

- **AbortController**: Downloads sử dụng AbortController để có thể cancel
- **Cleanup**: Proper cleanup của active downloads map
- **State Management**: Clear cả store và local state
- **Error Handling**: Graceful handling nếu cancel fails
- **User Feedback**: Loading state để user biết đang process

## Console Logs để debug:

```
Discarding active downloads before clearing playlist...
Discarding all downloads from layout...
All downloads discarded successfully
Cleared current playlist and cancelled downloads for new playlist
```

Bây giờ khi user confirm replace playlist, tất cả downloads sẽ được cancel properly!