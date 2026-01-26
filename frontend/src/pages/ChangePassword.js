import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/auth.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const result = await authService.changePassword(passwords);

    if (result.success) {
      setMessage('Đổi mật khẩu thành công');
      setTimeout(() => navigate('/dashboard'), 2000);
    } else {
      setMessage(result.message || 'Đổi mật khẩu thất bại');
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đổi Mật Khẩu</h2>
        {message && <div className={message.includes('thành công') ? 'success-message' : 'error-message'}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mật Khẩu Hiện Tại</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật Khẩu Mới</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              required
            />
          </div>

          <div className="form-group">
            <label>Xác Nhận Mật Khẩu Mới</label>
            <input
              type="password"
              name="newPasswordConfirm"
              value={passwords.newPasswordConfirm}
              onChange={handleChange}
              placeholder="Xác nhận mật khẩu mới"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
            Quay Lại
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
