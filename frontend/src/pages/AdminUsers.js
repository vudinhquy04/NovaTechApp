import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { userAPI } from '../services/api';
import '../styles/AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userAPI.getAll();
      console.log('Users response:', data);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        await userAPI.delete(id);
        fetchUsers();
      } catch (error) {
        alert('Xóa thất bại!');
      }
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? 
      <span className="status-badge green">🟢 Hoạt động</span> :
      <span className="status-badge red">🔴 Đã khóa</span>;
  };

  const getRoleBadge = (role) => {
    return role === 'admin' ? 
      <span className="role-badge admin">Admin</span> :
      <span className="role-badge staff">Staff</span>;
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || 
                        (filterStatus === 'active' && u.isActive) ||
                        (filterStatus === 'inactive' && !u.isActive);
    return matchSearch && matchStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <Header title="Quản lý người dùng" />
        
        <div className="users-container">
          <div className="users-header">
            <h3>Danh sách nhân viên và quản trị viên hệ thống</h3>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card-small blue">
              <div className="stat-icon">👥</div>
              <div>
                <div className="stat-label">TỔNG NHÂN SỰ</div>
                <div className="stat-value">{stats.total}</div>
              </div>
            </div>
            <div className="stat-card-small green">
              <div className="stat-icon">🟢</div>
              <div>
                <div className="stat-label">ĐANG HOẠT ĐỘNG</div>
                <div className="stat-value">{stats.active}</div>
              </div>
            </div>
            <div className="stat-card-small red">
              <div className="stat-icon">🔴</div>
              <div>
                <div className="stat-label">TÀI KHOẢN BỊ KHÓA</div>
                <div className="stat-value">{stats.inactive}</div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-section">
            <div className="table-header">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm theo tên, email hoặc số điện thoại..."
                className="search-input-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="table-actions">
                <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">Tất cả vai trò</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Đã khóa</option>
                </select>
                <select className="filter-select">
                  <option>Trạng thái</option>
                  <option>Hoạt động</option>
                  <option>Đã khóa</option>
                </select>
                <button className="btn-refresh">🔄 Làm mới</button>
                <button className="btn-add">+ Thêm người dùng</button>
              </div>
            </div>

            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>NGƯỜI DÙNG</th>
                    <th>THÔNG TIN LIÊN HỆ</th>
                    <th>VAI TRÒ</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-id">ID: {user._id?.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          <div>📧 {user.email}</div>
                          <div>📱 {user.phone || 'N/A'}</div>
                        </div>
                      </td>
                      <td>{getRoleBadge(user.role || 'staff')}</td>
                      <td>{getStatusBadge(user.isActive !== false)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-action edit" title="Sửa">✏️</button>
                          <button className="btn-action lock" title="Khóa">🔒</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="pagination">
              <span>Hiển thị 1 - {Math.min(4, filteredUsers.length)} của {filteredUsers.length} kết quả</span>
              <div className="pagination-buttons">
                <button>‹</button>
                <button className="active">1</button>
                <button>2</button>
                <button>3</button>
                <button>...</button>
                <button>›</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
