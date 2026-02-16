import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { productAPI, orderAPI, userAPI } from '../services/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
    inactiveProducts: 0,
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        productAPI.getAll(),
        orderAPI.getAll(),
        userAPI.getAll()
      ]);

      const products = productsRes.data || productsRes.products || [];
      const orders = ordersRes.orders || [];
      const users = usersRes.users || [];

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter(p => p.stock > 0).length,
        lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
        inactiveProducts: products.filter(p => p.stock === 0).length,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        inactiveUsers: users.filter(u => !u.isActive).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-content">
          <Header title="Thống kê doanh thu" />
          <div className="loading">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <Header title="Thống kê doanh thu" />
        
        <div className="dashboard-container">
          {/* Product Stats */}
          <div className="stats-section">
            <h3>Sản phẩm</h3>
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <div className="stat-label">TỔNG SẢN PHẨM</div>
                  <div className="stat-value">{stats.totalProducts}</div>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <div className="stat-label">ĐANG KINH DOANH</div>
                  <div className="stat-value">{stats.activeProducts}</div>
                </div>
              </div>
              <div className="stat-card yellow">
                <div className="stat-icon">⚠️</div>
                <div className="stat-info">
                  <div className="stat-label">SẮP HẾT HÀNG</div>
                  <div className="stat-value">{stats.lowStock}</div>
                </div>
              </div>
              <div className="stat-card red">
                <div className="stat-icon">🚫</div>
                <div className="stat-info">
                  <div className="stat-label">NGƯNG KINH DOANH</div>
                  <div className="stat-value">{stats.inactiveProducts}</div>
                </div>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="stats-section">
            <h3>Người dùng</h3>
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-label">TỔNG NHÂN SỰ</div>
                  <div className="stat-value">{stats.totalUsers}</div>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon">🟢</div>
                <div className="stat-info">
                  <div className="stat-label">ĐANG HOẠT ĐỘNG</div>
                  <div className="stat-value">{stats.activeUsers}</div>
                </div>
              </div>
              <div className="stat-card red">
                <div className="stat-icon">🔴</div>
                <div className="stat-info">
                  <div className="stat-label">TẠI KHOẢN BỊ KHÓA</div>
                  <div className="stat-value">{stats.inactiveUsers}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Stats */}
          <div className="stats-section">
            <h3>Đơn hàng</h3>
            <div className="stats-grid">
              <div className="stat-card yellow">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <div className="stat-label">CHỜ XỬ LÝ</div>
                  <div className="stat-value">{stats.pendingOrders}</div>
                </div>
              </div>
              <div className="stat-card blue">
                <div className="stat-icon">🚚</div>
                <div className="stat-info">
                  <div className="stat-label">ĐANG GIAO</div>
                  <div className="stat-value">{stats.totalOrders - stats.pendingOrders - stats.completedOrders - stats.cancelledOrders}</div>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <div className="stat-label">HOÀN TẤT</div>
                  <div className="stat-value">{stats.completedOrders}</div>
                </div>
              </div>
              <div className="stat-card red">
                <div className="stat-icon">❌</div>
                <div className="stat-info">
                  <div className="stat-label">ĐÃ HỦY</div>
                  <div className="stat-value">{stats.cancelledOrders}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
