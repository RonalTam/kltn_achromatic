# Cấu hình Gmail SMTP cho ACHROMATIC

Backend dùng Nodemailer kết nối trực tiếp tới Gmail SMTP. Cùng một bộ biến môi
trường có thể dùng ở localhost, Docker và dịch vụ deploy.

## 1. Tạo Google App Password

1. Đăng nhập tài khoản Google dùng để gửi email.
2. Bật [2-Step Verification](https://support.google.com/accounts/answer/185839).
3. Mở trang [App passwords](https://support.google.com/mail/answer/185833)
   của Google.
4. Tạo một App Password mới, ví dụ đặt tên `ACHROMATIC`.
5. Sao chép mật khẩu 16 ký tự. Đây là giá trị của `SMTP_PASS`; không dùng mật
   khẩu đăng nhập Google thông thường và không commit mật khẩu này lên Git.

Nếu không thấy mục App passwords, tài khoản có thể đang dùng cấu hình bảo mật
hoặc chính sách Google Workspace không cho phép tính năng này.

## 2. Localhost

Mở `backend/.env` và điền:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-account@gmail.com
SMTP_PASS=your-16-character-google-app-password
SMTP_FROM="ACHROMATIC <your-account@gmail.com>"
```

Xóa khoảng trắng trong App Password nếu Google đang hiển thị mật khẩu theo các
nhóm ký tự. Địa chỉ trong `SMTP_FROM` nên trùng với `SMTP_USER`, hoặc là một
alias đã được xác minh trong Gmail.

Khởi động lại backend sau khi sửa env:

```powershell
cd backend
npm run start:dev
```

Có thể thử bằng chức năng đăng ký tài khoản, quên mật khẩu hoặc tạo đơn hàng.
Nếu chưa điền đủ `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, backend dùng JSON
transport để luồng nghiệp vụ vẫn chạy nhưng không gửi email thật.

## 3. Production

Ưu tiên khai báo sáu biến SMTP trong phần Environment Variables/Secrets của
Render, Railway, VPS hoặc nền tảng deploy. Không đưa App Password vào image
Docker hay repository:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-account@gmail.com
SMTP_PASS=your-16-character-google-app-password
SMTP_FROM="ACHROMATIC <your-account@gmail.com>"
```

Nếu chạy backend trực tiếp trên VPS bằng file env, điền các giá trị trên vào
`backend/.env.production`, đặt `NODE_ENV=production`, rồi khởi động backend.
Ứng dụng sẽ ưu tiên `.env.production.local`, sau đó `.env.production`.

Nếu chạy bằng Docker Compose, đặt các biến trên trong file `.env` ở thư mục gốc
hoặc inject chúng từ secret manager trước khi chạy `docker compose up`.

## 4. Xử lý lỗi thường gặp

- `535`, `EAUTH`, `Username and Password not accepted`: kiểm tra 2-Step
  Verification, tạo lại App Password và bảo đảm không dùng mật khẩu Google.
- `ETIMEDOUT`, `ECONNECTION`: nền tảng deploy có thể chặn kết nối ra cổng 587;
  cần cho phép outbound SMTP hoặc đổi nhà cung cấp hosting.
- Email có địa chỉ From khác mong muốn: đặt `SMTP_FROM` trùng `SMTP_USER` hoặc
  cấu hình alias gửi thư đã được Google xác minh.
- Sau khi đổi mật khẩu Google, App Password cũ có thể bị thu hồi; hãy tạo App
  Password mới và cập nhật secret trên môi trường deploy.

Gmail SMTP phù hợp cho đồ án, demo và lưu lượng nhỏ. Nếu hệ thống gửi email giao
dịch với số lượng lớn, nên dùng một dịch vụ email transactional chuyên dụng.
