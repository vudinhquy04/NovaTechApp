import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ title }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    if (savedMode) {
      document.body.classList.add('dark-mode');
    }

    // Load notifications
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    
    // Listen for notification updates from other components
    const handleNotificationUpdate = () => {
      loadNotifications();
    };
    window.addEventListener('notificationUpdate', handleNotificationUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationUpdate', handleNotificationUpdate);
    };
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = () => {
    const storedNotifications = localStorage.getItem('adminNotifications');
    if (storedNotifications) {
      const notifs = JSON.parse(storedNotifications);
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } else {
      // Initialize with sample notifications
      const initialNotifications = [
        {
          id: 1,
          type: 'order',
          title: 'Đơn hàng mới',
          message: '2 đơn hàng mới cần xử lý',
          time: new Date().toISOString(),
          read: false
        },
        {
          id: 2,
          type: 'product',
          title: 'Sản phẩm sắp hết',
          message: '5 sản phẩm sắp hết hàng',
          time: new Date(Date.now() - 3600000).toISOString(),
          read: false
        },
        {
          id: 3,
          type: 'user',
          title: 'Người dùng mới',
          message: '3 người dùng mới đăng ký',
          time: new Date(Date.now() - 7200000).toISOString(),
          read: false
        }
      ];
      localStorage.setItem('adminNotifications', JSON.stringify(initialNotifications));
      setNotifications(initialNotifications);
      setUnreadCount(3);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    
    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    setUnreadCount(0);
  };

  const deleteNotification = (id) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return '🛒';
      case 'product': return '📦';
      case 'user': return '👤';
      default: return '🔔';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="admin-header">
      <h1 className="page-title">{title}</h1>
      <div className="header-actions">
        <button className="theme-toggle" onClick={toggleDarkMode} title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        
        <div className="notification-wrapper" ref={notificationRef}>
          <button className="notification-btn" onClick={toggleNotifications}>
            🔔
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Thông báo</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-read" onClick={markAllAsRead}>
                    Đánh dấu tất cả là đã đọc
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    <p>Không có thông báo nào</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                    >
                      <div className="notification-icon">{getNotificationIcon(notif.type)}</div>
                      <div className="notification-content">
                        <h4>{notif.title}</h4>
                        <p>{notif.message}</p>
                        <span className="notification-time">{getTimeAgo(notif.time)}</span>
                      </div>
                      <button
                        className="delete-notification"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
