# NovaTech

Fullstack application với chức năng authentication: Backend (Node.js/Express), Frontend (React), Mobile (React Native/Expo).

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Mobile
```bash
cd mobile
npm install
npm start
```

## Configuration

Backend `.env`:
```
MONGODB_URI=mongodb://localhost:27017/novatech
JWT_SECRET=your_secret_key
PORT=5001
```

## API Endpoints

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user
- `PUT /api/auth/update` - Cập nhật thông tin
- `POST /api/auth/change-password` - Đổi mật khẩu

## Tech Stack

**Backend:** Node.js, Express, MongoDB, JWT, bcryptjs  
**Frontend:** React, Axios, React Router  
**Mobile:** React Native, Expo, AsyncStorage
