import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Thống kê doanh thu' },
    { path: '/admin/products', icon: '📦', label: 'Quản lý sản phẩm' },
    { path: '/admin/users', icon: '👥', label: 'Quản lý người dùng' },
    { path: '/admin/orders', icon: '🛒', label: 'Quản lý đơn hàng' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src="/logo.png" alt="NovaTech" className="logo-icon" />
          <span className="logo-text">NovaTech</span>
        </div>
        <div className="admin-badge">ADMIN PANEL</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">TỔNG QUAN</div>
          {menuItems.slice(0, 1).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">QUẢN LY</div>
          {menuItems.slice(1).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="admin-profile">
          <div className="admin-avatar">SA</div>
          <div className="admin-info">
            <div className="admin-name">Super Admin</div>
            <div className="admin-email">admin@novatech.com</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
