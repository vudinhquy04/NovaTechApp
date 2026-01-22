import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h1>NovaTech</h1>
        <button onClick={handleLogout} className="btn-logout">Đăng Xuất</button>
      </nav>

      <div className="dashboard-content">
        <div className="user-card">
          <img src={user?.avatar} alt="Avatar" className="avatar" />
          <h2>{user?.fullName}</h2>
          <p>{user?.email}</p>
          
          <div className="user-info">
            <p><strong>Số điện thoại:</strong> {user?.phone}</p>
            <p><strong>Địa chỉ:</strong> {user?.address || 'Chưa cập nhật'}</p>
            <p><strong>Vai trò:</strong> {user?.role === 'admin' ? 'Quản Trị' : 'Người Dùng'}</p>
          </div>

          <div className="action-buttons">
            <button className="btn-secondary" onClick={() => navigate('/profile')}>
              Chỉnh Sửa Hồ Sơ
            </button>
            <button className="btn-secondary" onClick={() => navigate('/change-password')}>
              Đổi Mật Khẩu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
