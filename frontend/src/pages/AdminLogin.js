import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, ADMIN_CREDENTIALS } from '../services/api';
import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState(ADMIN_CREDENTIALS.email);
  const [password, setPassword] = useState(ADMIN_CREDENTIALS.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate with hardcoded credentials
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        // Try to call API to get real token, but proceed even if it fails
        try {
          const data = await authAPI.login(email, password);
          localStorage.setItem('adminToken', data.token);
        } catch (apiErr) {
          // If API fails, use dummy token
          localStorage.setItem('adminToken', 'admin-token-' + Date.now());
        }
        navigate('/admin/dashboard');
      } else {
        setError('Email hoặc mật khẩu không đúng!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">
            <img src="/logo.png" alt="NovaTech" className="logo-icon" />
            <span className="logo-text">NovaTech</span>
          </div>
          <h2>Hệ thống quản lý</h2>
          <p>Đăng nhập vào trang quản trị</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@novatech.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
