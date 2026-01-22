import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/auth.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    avatar: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
        setFormData({
          fullName: currentUser.fullName,
          phone: currentUser.phone,
          address: currentUser.address,
          avatar: currentUser.avatar
        });
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const result = await authService.updateProfile(formData);

    if (result.success) {
      setMessage('Cập nhật thông tin thành công');
      setTimeout(() => navigate('/dashboard'), 2000);
    } else {
      setMessage(result.message || 'Cập nhật thất bại');
    }

    setLoading(false);
  };

  if (!user) return <div>Đang tải...</div>;

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Chỉnh Sửa Hồ Sơ</h2>
        {message && <div className={message.includes('thành công') ? 'success-message' : 'error-message'}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và Tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Số Điện Thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Địa Chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Avatar URL</label>
            <input
              type="url"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Cập Nhật'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
            Quay Lại
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
