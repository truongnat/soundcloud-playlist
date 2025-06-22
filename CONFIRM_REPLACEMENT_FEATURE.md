# Confirm Playlist Replacement Feature

## Tính năng mới:

Khi người dùng nhập playlist mới mà đã có playlist cũ đang tải hoặc đã tải xong, hệ thống sẽ hiển thị modal confirm để xác nhận thay thế.

## Các trường hợp xử lý:

### 1. **Không có playlist hiện tại**
- ✅ Tải playlist mới ngay lập tức
- ❌ Không hiển thị confirm

### 2. **Có playlist đã tải xong (không có download đang chạy)**
- 🔵 Hiển thị modal **"Replace Current Playlist"**
- 📝 Thông tin: Tên playlist hiện tại và số tracks
- ⚪ Type: `info` (màu xanh)
- 🔘 Buttons: "Replace" / "Keep Current"

### 3. **Có downloads đang chạy hoặc background job**
- ⚠️ Hiển thị modal **"Active Downloads Detected"**
- 📝 Thông tin: Số downloads đang chạy + background job
- 🟡 Type: `warning` (màu vàng)
- 🔘 Buttons: "Load New Playlist" / "Keep Current"
- ℹ️ Cảnh báo: Downloads sẽ tiếp tục nhưng không track được

## Components được tạo:

### 1. **ConfirmModal.vue**
- Modal component tái sử d��ng
- Hỗ trợ 3 types: `info`, `warning`, `danger`
- Responsive design với backdrop blur
- ESC key để đóng
- Teleport to body để tránh z-index issues

### 2. **Logic trong index.vue**
- `handleBeforeFetch()`: Kiểm tra trạng thái hiện tại
- `handleConfirmReplace()`: Xử lý khi user confirm
- `handleCancelReplace()`: Xử lý khi user cancel
- `clearCurrentPlaylist()`: Xóa state hiện tại

### 3. **Cập nhật PlaylistInput.vue**
- Emit `before-fetch` event thay vì fetch ngay
- Listen `proceed-fetch` event để thực hiện fetch
- Tách logic fetch thành function riêng

## Cách test:

### Test Case 1: Playlist trống
1. Mở app lần đầu
2. Nhập playlist URL
3. ✅ Expect: Tải ngay lập tức, không có confirm

### Test Case 2: Thay thế playlist đã tải
1. Tải playlist A (chờ hoàn thành)
2. Nhập playlist B URL
3. ✅ Expect: Hiển thị modal "Replace Current Playlist"
4. Click "Replace"
5. ✅ Expect: Xóa playlist A, tải playlist B

### Test Case 3: Có downloads đang chạy
1. Tải playlist A
2. Bắt đầu download một số tracks
3. Nhập playlist B URL
4. ✅ Expect: Hiển thị modal "Active Downloads Detected"
5. Click "Load New Playlist"
6. ✅ Expect: Downloads tiếp tục, UI chuyển sang playlist B

### Test Case 4: Có background job
1. Tải playlist lớn với background processing
2. Trong khi đang process, nhập playlist mới
3. ✅ Expect: Hiển thị modal warning về background job
4. Click "Load New Playlist"
5. ✅ Expect: Background job tiếp tục, UI chuyển sang playlist mới

## UI/UX Features:

- **Responsive**: Hoạt động tốt trên mobile và desktop
- **Accessible**: Keyboard navigation (ESC to close)
- **Visual Feedback**: Icons và colors phù hợp với từng type
- **Clear Information**: Hiển thị đầy đủ thông tin để user quyết định
- **Non-blocking**: Downloads/jobs tiếp tục chạy sau khi confirm

## Technical Implementation:

- **Event-driven**: Sử dụng custom events để communicate
- **State Management**: Proper cleanup khi thay thế playlist
- **Error Handling**: Graceful handling của edge cases
- **Performance**: Không ảnh hưởng đến performance của downloads