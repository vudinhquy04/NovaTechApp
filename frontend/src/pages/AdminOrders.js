import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { orderAPI } from '../services/api';
import '../styles/AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderAPI.getAll();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'CHỜ XÁC NHẬN', class: 'yellow' },
      shipping: { label: 'ĐANG GIAO', class: 'blue' },
      completed: { label: 'HOÀN TẤT', class: 'green' },
      cancelled: { label: 'ĐÃ HỦY', class: 'red' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <Header title="Quản lý đơn hàng" />
        
        <div className="orders-container">
          {/* Stats Cards */}
          <div className="stats-row">
            <div className="stat-card-small yellow">
              <div className="stat-icon">📋</div>
              <div>
                <div className="stat-label">CHỜ XỬ LÝ</div>
                <div className="stat-value">{stats.pending}</div>
              </div>
            </div>
            <div className="stat-card-small blue">
              <div className="stat-icon">🚚</div>
              <div>
                <div className="stat-label">ĐANG GIAO</div>
                <div className="stat-value">{stats.shipping}</div>
              </div>
            </div>
            <div className="stat-card-small green">
              <div className="stat-icon">✅</div>
              <div>
                <div className="stat-label">HOÀN TẤT</div>
                <div className="stat-value">{stats.completed}</div>
              </div>
            </div>
            <div className="stat-card-small red">
              <div className="stat-icon">❌</div>
              <div>
                <div className="stat-label">ĐÃ HỦY</div>
                <div className="stat-value">{stats.cancelled}</div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="table-section">
            <div className="table-header">
              <input
                type="text"
                placeholder="🔍 Tìm theo mã đơn, khách hàng..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="table-actions">
                <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="shipping">Đang giao</option>
                  <option value="completed">Hoàn tất</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                <button className="btn-refresh">🔄 Làm mới</button>
                <button className="btn-export">📊 Xuất báo cáo (Excel)</button>
              </div>
            </div>

            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>MÃ ĐƠN HÀNG</th>
                    <th>KHÁCH HÀNG</th>
                    <th>TỔNG TIỀN</th>
                    <th>TRẠNG THÁI</th>
                    <th>NGÀY ĐẶT</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr key={order._id}>
                      <td>{index + 1}</td>
                      <td className="order-id">{order._id}</td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">{order.customer?.name}</div>
                          <div className="customer-email">{order.customer?.email}</div>
                        </div>
                      </td>
                      <td className="price">{order.total?.toLocaleString('vi-VN')}đ</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-action view" title="Xem">👁️</button>
                          <button className="btn-action edit" title="Sửa">✏️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="pagination">
              <span>Hiển thị 1 đến {Math.min(4, filteredOrders.length)} trong {filteredOrders.length} đơn hàng</span>
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

export default AdminOrders;
