import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import '../styles/OrderHistory.css';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'delivering', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'all' ? null : activeTab;
      const allOrders = await orderService.getOrders(status);
      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: 'CHỜ XỬ LÝ',
      processing: 'ĐANG XỬ LÝ',
      shipped: 'ĐANG GIAO HÀNG',
      delivered: 'ĐÃ HOÀN THÀNH',
      cancelled: 'ĐÃ HỦY',
    };
    return statusMap[status] || status.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleTrackOrder = (orderId) => {
    alert('Tính năng theo dõi đơn hàng đang phát triển');
  };

  const handleViewDetails = (orderId) => {
    alert('Tính năng chi tiết đơn hàng đang phát triển');
  };

  const handleRepurchase = (orderId) => {
    alert('Tính năng mua lại đang phát triển');
  };

  const handleRate = (orderId) => {
    // Navigate to product reviews or write review
    navigate('/product-reviews');
  };

  const handleViewCancelReason = (orderId) => {
    navigate(`/cancel-order/${orderId}`);
  };

  const renderOrderCard = (order) => {
    const status = order.status;
    const isDelivering = status === 'shipped';
    const isDelivered = status === 'delivered';
    const isCancelled = status === 'cancelled';

    return (
      <div key={order._id} className="order-card">
        <div className="order-header">
          <span className="status-text">{getStatusLabel(status)}</span>
        </div>

        <div className="order-info">
          <span className="order-meta">
            Mã đơn: #{order.orderNumber} • Ngày đặt: {formatDate(order.createdAt)}
          </span>
        </div>

        <div className="product-section">
          {order.items && order.items[0] && (
            <>
              <img
                src={order.items[0].product?.image || 'https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg'}
                alt="Product"
                className="product-image"
              />
              <div className="product-info">
                <div className="product-name">
                  Sản phẩm: {order.items[0].product?.name || 'Sản phẩm'} (x{order.items[0].quantity || 1})
                </div>
                <div className="total-amount">
                  Tổng thanh toán: <span className="amount-value">{order.totalAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="action-buttons">
          {isDelivering && (
            <>
              <button
                className="track-button"
                onClick={() => handleTrackOrder(order._id)}
              >
                🚚 Theo dõi
              </button>
              <button
                className="detail-button"
                onClick={() => handleViewDetails(order._id)}
              >
                Chi tiết
              </button>
            </>
          )}

          {isDelivered && (
            <>
              <button
                className="repurchase-button"
                onClick={() => handleRepurchase(order._id)}
              >
                🛒 Mua lại
              </button>
              <button
                className="detail-button"
                onClick={() => handleRate(order._id)}
              >
                Đánh giá
              </button>
            </>
          )}

          {isCancelled && (
            <button
              className="cancel-detail-button"
              onClick={() => handleViewCancelReason(order._id)}
            >
              Xem chi tiết lý do hủy
            </button>
          )}

          {!isDelivering && !isDelivered && !isCancelled && (
            <button
              className="detail-button"
              onClick={() => handleViewDetails(order._id)}
            >
              Chi tiết
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="order-history-container">
      {/* Header */}
      <div className="order-history-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="header-title">Lịch sử mua hàng</h1>
        <button className="search-button">🔍</button>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-wrapper">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="loading-container">
          <div className="loading">Đang tải...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-container">
          <div className="empty-text">Chưa có đơn hàng nào</div>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(renderOrderCard)}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
