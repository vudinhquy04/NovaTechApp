import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="admin-header">
      <h1 className="page-title">{title}</h1>
      <div className="header-actions">
        <button className="theme-toggle">🌙</button>
        <button className="notification-btn">
          🔔
          <span className="notification-badge">3</span>
        </button>
        <div className="user-menu">
          <span className="user-name">Admin</span>
          <button className="logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
