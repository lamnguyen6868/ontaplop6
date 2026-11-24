# 🎓 Học Vui Lớp 6 (Phiên bản v2 - Có trang Admin Phụ Huynh)

Ứng dụng web ôn tập Toán & Ngữ Văn lớp 6 chuẩn Mobile-first, tích hợp **Giao diện Admin Phụ Huynh** (Mật khẩu: `123456789`) cho phép tải lên **Hình ảnh, File Word (.docx), File Excel (.xlsx/.csv)** để cập nhật kho bài học và câu hỏi trắc nghiệm.

## 📁 Cấu trúc thư mục

```text
hoc-vui-lop-6-v2/
├── index.html        # Giao diện chính + Modal đăng nhập & Quản trị Admin
├── css/
│   └── style.css     # Giao diện Mobile-first, Dropzone upload, Thẻ lật 3D
├── js/
│   ├── config.js     # Mật khẩu Admin (123456789), Link Google Sheets mặc định
│   ├── data.js       # Kho dữ liệu kiến thức & câu hỏi gốc
│   ├── admin.js      # Xử lý đọc file Excel, Word, nén Hình ảnh & lưu IndexedDB
│   └── app.js        # Xử lý học tập, làm bài trắc nghiệm & đồng bộ điểm
└── README.md         # Hướng dẫn sử dụng
```

## 🔐 Cách sử dụng trang Admin Phụ Huynh

1. Ở màn hình **Trang chủ**, bấm nút **Admin Phụ Huynh** ở cuối trang.
2. Nhập mật khẩu: **`123456789`** (có thể đổi trong tệp `js/config.js`).
3. Tại tab **Nạp File / Ảnh**, bạn có thể:
   - **Nhập từ Excel (`.xlsx`, `.xls`, `.csv`):** Bấm *"Tải file Excel mẫu"* để lấy bảng mẫu chuẩn, điền câu hỏi Toán/Văn rồi tải lên.
   - **Nhập từ Word (`.docx`):** Soạn câu hỏi theo mẫu `Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: A` hệ thống sẽ tự động tách thành đề trắc nghiệm; nếu là văn bản lý thuyết sẽ tự lưu vào mục Ôn tập.
   - **Tải lên Hình ảnh:** Chụp ảnh bài tập/sơ đồ và gắn trực tiếp vào Lý thuyết hoặc Câu hỏi trắc nghiệm.
4. **Đồng bộ sang điện thoại của con khi dùng GitHub Pages:**
   - Vào tab **Kho đã nạp** trong Admin ➔ bấm **Xuất file `data.js` (GitHub)** và tải đè lên tệp `js/data.js` trên GitHub của bạn để mọi thiết bị mở link đều thấy bài tập mới.
