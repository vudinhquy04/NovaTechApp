# NovaTech - Ứng Dụng Đăng Ký & Đăng Nhập

Đây là một fullstack application với chức năng xác thực người dùng hoàn chỉnh bao gồm Backend (Node.js/Express), Frontend Web (React), và Mobile App (React Native).

## Cấu Trúc Project

```
NovaTechApp/
├── backend/          # Express.js API Server
├── frontend/         # React Web App
└── mobile/          # React Native Mobile App
```

## Backend Setup

### Yêu Cầu
- Node.js v14+
- MongoDB (local hoặc cloud)

### Cài Đặt

```bash
cd backend
npm install
```

### File Cấu Hình (.env)

```
MONGODB_URI=mongodb://localhost:27017/novatech
JWT_SECRET=your_jwt_secret_key_here_change_in_production
PORT=5001
NODE_ENV=development
```

### Chạy Backend

```bash
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5001`

### Cấu Trúc Backend

- `models/User.js` - Schema User với validation
- `routes/authRoutes.js` - Tất cả các endpoint authentication
- `middleware/authMiddleware.js` - JWT verification middleware
- `utils/tokenUtils.js` - JWT token generation
- `index.js` - Express server chính

### API Endpoints

#### Đăng Ký
```
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "0912345678",
  "password": "password123",
  "passwordConfirm": "password123",
  "address": "123 Main St"
}
```

#### Đăng Nhập
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Lấy Thông Tin Hiện Tại
```
GET /api/auth/me
Authorization: Bearer <token>
```

#### Cập Nhật Thông Tin
```
PUT /api/auth/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "phone": "0987654321",
  "address": "456 Oak Ave",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Đổi Mật Khẩu
```
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword",
  "newPasswordConfirm": "newpassword"
}
```

## Frontend Web Setup

### Yêu Cầu
- Node.js v14+
- npm hoặc yarn

### Cài Đặt

```bash
cd frontend
npm install
```

### Chạy Frontend

```bash
npm start
```

Frontend sẽ mở tại: `http://localhost:3000`

### Trang Web

1. **Login** - `/login` - Đăng nhập vào tài khoản
2. **Register** - `/register` - Tạo tài khoản mới
3. **Dashboard** - `/dashboard` - Xem thông tin tài khoản
4. **Profile** - `/profile` - Chỉnh sửa thông tin cá nhân
5. **Change Password** - `/change-password` - Đổi mật khẩu

### Cấu Trúc Frontend

- `src/services/authService.js` - API service với Axios
- `src/pages/Login.js` - Trang đăng nhập
- `src/pages/Register.js` - Trang đăng ký
- `src/pages/Dashboard.js` - Trang chính sau khi đăng nhập
- `src/pages/Profile.js` - Trang chỉnh sửa hồ sơ
- `src/pages/ChangePassword.js` - Trang đổi mật khẩu
- `src/styles/` - CSS files

## Mobile App Setup

### Yêu Cầu
- Node.js v14+
- Expo CLI: `npm install -g expo-cli`
- Android Studio / Xcode (nếu muốn build)

### Cài Đặt

```bash
cd mobile
npm install
```

### Chạy Mobile App

```bash
npm start
```

Sau đó nhấn:
- `a` để chạy trên Android Emulator
- `i` để chạy trên iOS Simulator
- Quét QR code bằng Expo Go app trên thiết bị thực

### Cấu Trúc Mobile

- `src/services/authService.js` - API service với Axios
- `src/screens/LoginScreen.js` - Màn hình đăng nhập
- `src/screens/RegisterScreen.js` - Màn hình đăng ký
- `src/screens/DashboardScreen.js` - Màn hình chính
- `src/screens/ProfileScreen.js` - Màn hình chỉnh sửa hồ sơ
- `src/screens/ChangePasswordScreen.js` - Màn hình đổi mật khẩu
- `App.js` - Stack Navigator chính

## Tính Năng

### Xác Thực
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với email/password
- ✅ JWT token authentication
- ✅ Token lưu trữ locally (localStorage/AsyncStorage)

### Quản Lý Tài Khoản
- ✅ Xem thông tin tài khoản
- ✅ Cập nhật thông tin cá nhân
- ✅ Đổi mật khẩu
- ✅ Đăng xuất

### Bảo Mật
- ✅ Password hashing với bcryptjs
- ✅ JWT token validation
- ✅ Email validation
- ✅ Phone number validation
- ✅ Input sanitization

## Kiểm Tra Dữ Liệu

### User Schema
- `fullName`: Tên người dùng (bắt buộc, tối thiểu 2 ký tự)
- `email`: Email (bắt buộc, duy nhất, hợp lệ)
- `phone`: Số điện thoại (bắt buộc, duy nhất, định dạng VN)
- `password`: Mật khẩu (bắt buộc, tối thiểu 6 ký tự, được hash)
- `address`: Địa chỉ (tuỳ chọn)
- `avatar`: Hình đại diện (mặc định là placeholder)
- `role`: Vai trò (user/admin, mặc định là user)
- `isVerified`: Xác minh email (mặc định false)
- `createdAt`: Ngày tạo
- `updatedAt`: Ngày cập nhật

## Troubleshooting

### Backend không chạy
```bash
# Kiểm tra MongoDB
# Chạy MongoDB service trước

# Xóa node_modules và reinstall
rm -r node_modules
npm install
npm run dev
```

### Frontend không kết nối Backend
```bash
# Kiểm tra backend đang chạy tại port 5001
# Kiểm tra CORS settings trong backend/index.js
# Đảm bảo proxy trong frontend/package.json đúng
```

### Mobile app không kết nối
```bash
# Sử dụng IP address của máy tính thay vì localhost
# Ví dụ: http://192.168.x.x:5001
# Cập nhật URL trong mobile/src/services/authService.js
```

## Security Tips

1. **Thay đổi JWT_SECRET** trước khi deploy lên production
2. **Sử dụng HTTPS** trên production
3. **Validate input** ở cả frontend và backend
4. **Implement rate limiting** cho login/register endpoints
5. **Sử dụng environment variables** cho sensitive data
6. **Implement email verification** trước khi activate account
7. **Thêm password reset** functionality

## Tiếp Theo

- [ ] Thêm email verification
- [ ] Thêm password reset functionality
- [ ] Thêm social login (Google, Facebook)
- [ ] Thêm 2FA (Two Factor Authentication)
- [ ] Thêm user roles & permissions
- [ ] Thêm user activity logging
- [ ] Thêm database backup strategy

## Support

Nếu có vấn đề, vui lòng kiểm tra:
1. Terminal logs
2. Browser console (F12)
3. MongoDB connection status
4. Port availability
