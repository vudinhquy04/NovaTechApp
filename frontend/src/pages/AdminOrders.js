import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { orderAPI } from '../services/api';
import { notifyOrderStatusChange, notifyNewOrder } from '../utils/notificationUtils';
import '../styles/AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const previousOrderCountRef = useRef(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderAPI.getAll();
      const fetchedOrders = data.orders || [];
      
      // Check for new orders
      if (previousOrderCountRef.current > 0 && fetchedOrders.length > previousOrderCountRef.current) {
        const newOrdersCount = fetchedOrders.length - previousOrderCountRef.current;
        const latestOrder = fetchedOrders[0]; // Assuming orders are sorted by date desc
        
        if (latestOrder) {
          notifyNewOrder(latestOrder.orderNumber, latestOrder.customerName || 'Khách hàng');
          window.dispatchEvent(new Event('notificationUpdate'));
        }
      }
      
      previousOrderCountRef.current = fetchedOrders.length;
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      
      // Find order to get order number
      const order = orders.find(o => o._id === orderId);
      if (order) {
        // Create notification
        notifyOrderStatusChange(order.orderNumber, newStatus);
      }
      
      alert('Cập nhật trạng thái đơn hàng thành công!');
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Update selected order if it's open in modal
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      // Trigger Header to reload notifications
      window.dispatchEvent(new Event('notificationUpdate'));
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật trạng thái!');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'CHỜ XÁC NHẬN', class: 'yellow' },
      processing: { label: 'ĐANG XỬ LÝ', class: 'orange' },
      shipping: { label: 'ĐANG GIAO', class: 'blue' },
      delivered: { label: 'HOÀN TẤT', class: 'green' },
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
    const matchSearch = o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.customerInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.customerInfo?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.customerInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
  };

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    completed: orders.filter(o => o.status === 'delivered' || o.status === 'completed').length,
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
                placeholder="🔍 Tìm theo mã đơn, tên khách hàng, email..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="table-actions">
                <button 
                  className={`btn-filter ${showFilterPanel ? 'active' : ''}`}
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                >
                  🔽 Bộ lọc
                  {filterStatus !== 'all' && (
                    <span className="filter-badge">•</span>
                  )}
                </button>
                <button className="btn-refresh" onClick={fetchOrders}>🔄 Làm mới</button>
                <button className="btn-export">📊 Xuất báo cáo (Excel)</button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
              <div className="filter-panel">
                <div className="filter-group">
                  <label>Trạng thái đơn hàng</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">⏳ Chờ xử lý</option>
                    <option value="shipping">🚚 Đang giao</option>
                    <option value="completed">✅ Hoàn tất</option>
                    <option value="cancelled">❌ Đã hủy</option>
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
                      <td className="order-id">{order.orderNumber}</td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">{order.customerInfo?.fullName}</div>
                          <div className="customer-email">{order.customerInfo?.phone || order.customerInfo?.email}</div>
                        </div>
                      </td>
                      <td className="price">{order.finalAmount?.toLocaleString('vi-VN')}đ</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-action view" onClick={() => handleViewOrder(order)} title="Xem chi tiết">👁️</button>
                          <button className="btn-action edit" onClick={() => handleViewOrder(order)} title="Cập nhật">✏️</button>
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

        {/* Modal View/Edit Order */}
        {showModal && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Chi tiết đơn hàng #{selectedOrder.orderNumber}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              
              <div className="order-detail">
                {/* Customer Info */}
                <div className="detail-section">
                  <h3>Thông tin khách hàng</h3>
                  <div className="info-row">
                    <span className="label">Tên khách hàng:</span>
                    <span className="value">{selectedOrder.customerInfo?.fullName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Số điện thoại:</span>
                    <span className="value">{selectedOrder.customerInfo?.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Địa chỉ:</span>
                    <span className="value">{selectedOrder.customerInfo?.address}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Ngày đặt:</span>
                    <span className="value">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                </div>

                {/* Order Status */}
                <div className="detail-section">
                  <h3>Trạng thái đơn hàng</h3>
                  <div className="status-update">
                    <div className="current-status">
                      Trạng thái hiện tại: {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="status-actions">
                      {selectedOrder.status === 'pending' && (
                        <>
                          <button 
                            className="btn-status confirm"
                            onClick={() => handleUpdateStatus(selectedOrder._id, 'processing')}
                          >
                            ✅ Xác nhận đơn hàng
                          </button>
                          <button 
                            className="btn-status cancel"
                            onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                          >
                            ❌ Hủy đơn
                          </button>
                        </>
                      )}
                      {selectedOrder.status === 'processing' && (
                        <button 
                          className="btn-status confirm"
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'shipping')}
                        >
                          🚚 Bắt đầu giao hàng
                        </button>
                      )}
                      {selectedOrder.status === 'shipping' && (
                        <button 
                          className="btn-status complete"
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered')}
                        >
                          ✅ Hoàn tất giao hàng
                        </button>
                      )}
                      {(selectedOrder.status === 'delivered' || selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled') && (
                        <p className="status-note">
                          Đơn hàng đã {selectedOrder.status === 'delivered' || selectedOrder.status === 'completed' ? 'hoàn tất' : 'bị hủy'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="detail-section">
                  <h3>Tổng quan đơn hàng</h3>
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Tổng tiền hàng:</span>
                      <span className="price">{selectedOrder.totalAmount?.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="summary-row">
                      <span>Phí vận chuyển:</span>
                      <span className="price">{selectedOrder.shippingFee?.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="summary-row">
                      <span><strong>Tổng cộng:</strong></span>
                      <span className="price"><strong>{selectedOrder.finalAmount?.toLocaleString('vi-VN')}đ</strong></span>
                    </div>
                    <div className="summary-row">
                      <span>Phương thức thanh toán:</span>
                      <span>{selectedOrder.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowModal(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
