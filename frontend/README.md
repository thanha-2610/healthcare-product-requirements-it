HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY CHƯƠNG TRÌNH
Tài liệu này hướng dẫn cách thiết lập môi trường và khởi chạy ứng dụng bao gồm Backend (Python/Flask) và Frontend (Next.js/React).

1. Yêu cầu hệ thống
   Node.js: Phiên bản 18.x trở lên.

Python: Phiên bản 3.9 trở lên. 

2. Cấu trúc thư mục Source gồm
   Plaintext
   Source/
   ├── backend/ # Chứa mã nguồn Python
   │ ├── app.py # File chạy chính
   │ ├── healthcare_data.csv // data
   │ └── data
   │       └── search_history.json
   └── frontend/ # Chứa mã nguồn React/Next.js
   ├── components/ui
   ├── pages/ (hoặc app/)
   └── package.json
3. Cài đặt và Khởi chạy
   Bước 1: Thiết lập Backend (Python)
   Mở terminal và di chuyển vào thư mục backend:

Di chuyển vào thư mục:

Bash
cd backend
Cài đặt thư viện (nếu cần): (Giả sử dự án dùng Flask và Pandas)

Bash
pip install flask flask-cors pandas
Chạy server:

Bash
python app.py
Server Backend thường sẽ chạy tại địa chỉ: http://127.0.0.1:5000 hoặc http://localhost:5000

Bước 2: Thiết lập Frontend (React/Next.js)
Mở một terminal mới (không tắt terminal backend):

Di chuyển vào thư mục:

Bash
cd frontend
Cài đặt các gói phụ thuộc (Dependencies):

Bash
npm install
Chạy ứng dụng ở chế độ phát triển:

Bash
npm run dev
Truy cập ứng dụng tại: http://localhost:3000

4. Các tệp dữ liệu quan trọng
   healthcare_data.csv: Chứa dữ liệu sản phẩm y tế dùng cho thuật toán gợi ý.

search_history.json: Lưu trữ lịch sử tìm kiếm của người dùng để cá nhân hóa kết quả.

5. Lưu ý khi sử dụng
   Đảm bảo Backend đã chạy trước khi thao tác trên giao diện Frontend để tránh lỗi kết nối API.

Nếu gặp lỗi cổng (Port), vui lòng kiểm tra xem có ứng dụng nào khác đang chiếm dụng cổng 3000 hoặc 5000 hay không.
