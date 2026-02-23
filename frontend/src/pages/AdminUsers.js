import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { userAPI } from '../services/api';
import { notifyNewUser } from '../utils/notificationUtils';
import '../styles/AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const previousUserCountRef = useRef(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'staff',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userAPI.getAll();
      console.log('Users response:', data);
      const fetchedUsers = data.users || [];
      
      // Check for new users (excluding admin/staff roles)
      if (previousUserCountRef.current > 0 && fetchedUsers.length > previousUserCountRef.current) {
        const latestUser = fetchedUsers[0]; // Assuming users are sorted by date desc
        
        if (latestUser && latestUser.role === 'user') {
          notifyNewUser(latestUser.name || 'Người dùng mới', latestUser.email);
          window.dispatchEvent(new Event('notificationUpdate'));
        }
      }
      
      previousUserCountRef.current = fetchedUsers.length;
      setUsers(fetchedUsers);
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
        alert('Xóa người dùng thành công!');
        fetchUsers();
      } catch (error) {
        alert('Xóa thất bại!');
      }
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'staff',
      isActive: true
    });
    setShowModal(true);
  };

  const handleView = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',  // Don't show password
      phone: user.phone || '',
      role: user.role || 'staff',
      isActive: user.isActive !== false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      
      // Don't send password if empty (for edit mode)
      if (editingUser && !data.password) {
        delete data.password;
      }

      if (editingUser) {
        await userAPI.update(editingUser._id, data);
        alert('Cập nhật người dùng thành công!');
      } else {
        await userAPI.create(data);
        alert('Thêm người dùng thành công!');
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleToggleStatus = async (user) => {
    if (window.confirm(`Bạn có chắc muốn ${user.isActive ? 'khóa' : 'mở khóa'} tài khoản này?`)) {
      try {
        await userAPI.update(user._id, { isActive: !user.isActive });
        alert('Cập nhật trạng thái thành công!');
        fetchUsers();
      } catch (error) {
        alert('Có lỗi xảy ra!');
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
                        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || 
                        (filterStatus === 'active' && u.isActive) ||
                        (filterStatus === 'inactive' && !u.isActive);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchStatus && matchRole;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterRole('all');
  };

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
                <button 
                  className={`btn-filter ${showFilterPanel ? 'active' : ''}`}
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                >
                  🔽 Bộ lọc
                  {(filterStatus !== 'all' || filterRole !== 'all') && (
                    <span className="filter-badge">•</span>
                  )}
                </button>
                <button className="btn-refresh" onClick={fetchUsers}>🔄 Làm mới</button>
                <button className="btn-add" onClick={handleAdd}>+ Thêm người dùng</button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
              <div className="filter-panel">
                <div className="filter-group">
                  <label>Vai trò</label>
                  <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Trạng thái</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">Tất cả</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Đã khóa</option>
                  </select>
                </div>

                <div className="filter-actions">
                  <button className="btn-clear-filter" onClick={clearFilters}>
                    ✕ Xóa bộ lọc
                  </button>
                </div>
              </div>
            )}

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
                          <button className="btn-action view" onClick={() => handleView(user)} title="Xem">👁️</button>
                          <button className="btn-action edit" onClick={() => handleEdit(user)} title="Sửa">✏️</button>
                          <button className="btn-action lock" onClick={() => handleToggleStatus(user)} title={user.isActive ? 'Khóa' : 'Mở khóa'}>
                            {user.isActive ? '🔒' : '🔓'}
                          </button>
                          <button className="btn-action delete" onClick={() => handleDelete(user._id)} title="Xóa">🗑️</button>
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

        {/* Modal View User */}
        {showViewModal && viewingUser && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal-content modal-view" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Thông tin người dùng</h2>
                <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
              </div>
              
              <div className="user-detail-view">
                <div className="user-detail-avatar-section">
                  <div className="user-detail-avatar">
                    {viewingUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="user-detail-name">{viewingUser.name}</h3>
                  <div className="user-detail-id">ID: {viewingUser._id}</div>
                  <div className="user-detail-status">
                    {getStatusBadge(viewingUser.isActive !== false)}
                  </div>
                </div>
                
                <div className="user-detail-info">
                  <div className="detail-section">
                    <h4>Thông tin cơ bản</h4>
                    <div className="detail-row">
                      <span className="detail-label">👤 Họ và tên:</span>
                      <span className="detail-value">{viewingUser.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">📧 Email:</span>
                      <span className="detail-value">{viewingUser.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">📱 Số điện thoại:</span>
                      <span className="detail-value">{viewingUser.phone || 'Chưa cập nhật'}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Thông tin hệ thống</h4>
                    <div className="detail-row">
                      <span className="detail-label">🎭 Vai trò:</span>
                      <span className="detail-value">{getRoleBadge(viewingUser.role || 'staff')}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🔐 Trạng thái:</span>
                      <span className="detail-value">
                        {viewingUser.isActive !== false ? 'Đang hoạt động' : 'Đã bị khóa'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">📅 Ngày tạo:</span>
                      <span className="detail-value">
                        {viewingUser.createdAt ? new Date(viewingUser.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowViewModal(false)}>
                  Đóng
                </button>
                <button className="btn-save" onClick={() => {
                  setShowViewModal(false);
                  handleEdit(viewingUser);
                }}>
                  ✏️ Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Add/Edit User */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingUser ? 'Sửa thông tin người dùng' : 'Thêm người dùng mới'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="example@novatech.com"
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu {!editingUser && '*'}</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                    placeholder={editingUser ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Vai trò *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="form-group-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                      />
                      <span>Tài khoản hoạt động</span>
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-save">
                    {editingUser ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
