import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../services/orderService';
import '../styles/CancelOrder.css';

const CANCEL_REASONS = [
  { value: 'changed_mind', label: 'Thay đổi ý định' },
  { value: 'better_price', label: 'Tìm thấy giá tốt hơn' },
  { value: 'long_delivery', label: 'Thời gian giao hàng quá lâu' },
  { value: 'other', label: 'Khác' },
];

const CancelOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      // For demo purposes, create a mock order if no orderId provided
      setOrder({
        _id: 'demo',
        orderNumber: 'NT-9982',
        totalAmount: 24500000,
        status: 'processing',
        items: [{
          product: {
            name: 'Đèn bàn LED',
            image: 'https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg',
            price: 24500000
          },
          quantity: 1
        }]
      });
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      setError('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedReason) {
      setError('Vui lòng chọn lý do hủy đơn');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      await orderService.cancelOrder(order._id, {
        cancellationReason: selectedReason,
        cancellationNotes: notes || null
      });
      alert('Đơn hàng đã được hủy thành công');
      navigate(-1);
    } catch (error) {
      setError(error.message || 'Không thể hủy đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="cancel-order-container">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="cancel-order-container">
        <div className="error-message">Không tìm thấy đơn hàng</div>
      </div>
    );
  }

  const statusLabels = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy'
  };

  const statusColors = {
    pending: '#FFA500',
    processing: '#FF8C00',
    shipped: '#4169E1',
    delivered: '#32CD32',
    cancelled: '#DC143C'
  };

  return (
    <div className="cancel-order-container">
      {/* Header */}
      <div className="cancel-order-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="header-title">Hủy đơn hàng</h1>
        <div className="header-placeholder"></div>
      </div>

      <div className="cancel-order-content">
        {/* Order Information */}
        <div className="section">
          <h2 className="section-title">Thông tin đơn hàng</h2>
          <div className="order-card">
            {order.items && order.items[0] && (
              <img
                src={order.items[0].product?.image || 'https://favorlamp.com/wp-content/uploads/2022/09/RD_RL_36_2-768x768.jpg'}
                alt="Product"
                className="product-image"
              />
            )}
            <div className="order-info">
              <div className="order-number">Đơn hàng #{order.orderNumber}</div>
              <div className="total-amount">
                Tổng thanh toán: <span className="amount-value">{order.totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
            <div
              className="status-badge"
              style={{ backgroundColor: statusColors[order.status] || '#999' }}
            >
              {statusLabels[order.status] || order.status}
            </div>
          </div>
        </div>

        {/* Cancellation Reason */}
        <div className="section">
          <h2 className="section-title">
            Lý do hủy đơn <span className="required">(Bắt buộc)</span>
          </h2>
          {CANCEL_REASONS.map((reason) => (
            <div
              key={reason.value}
              className={`reason-option ${selectedReason === reason.value ? 'selected' : ''}`}
              onClick={() => setSelectedReason(reason.value)}
            >
              <span className="reason-label">{reason.label}</span>
              <div className="radio-container">
                {selectedReason === reason.value ? (
                  <div className="radio-selected">
                    <div className="radio-inner"></div>
                  </div>
                ) : (
                  <div className="radio-unselected"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Notes */}
        <div className="section">
          <h2 className="section-title">Ghi chú thêm</h2>
          <textarea
            className="notes-input"
            placeholder="Nhập thêm thông tin chi tiết (tùy chọn)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        {/* Refund Info Banner */}
        <div className="info-banner">
          <span className="info-icon">ℹ️</span>
          <span className="info-text">
            Số tiền hoàn lại sẽ được chuyển vào tài khoản của bạn trong vòng 3-5 ngày làm việc sau khi yêu cầu được duyệt.
          </span>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Confirm Button */}
      <div className="button-container">
        <button
          className="confirm-button"
          onClick={handleCancel}
          disabled={submitting}
        >
          {submitting ? 'Đang xử lý...' : 'XÁC NHẬN HỦY'}
        </button>
      </div>
    </div>
  );
};

export default CancelOrder;
