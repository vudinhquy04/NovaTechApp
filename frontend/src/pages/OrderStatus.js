import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../services/orderService';
import '../styles/OrderStatus.css';

const TIMELINE_STEPS = [
  { key: 'placed', label: 'Đơn hàng đã đặt', icon: 'check' },
  { key: 'confirmed', label: 'Xác nhận đơn hàng', icon: 'check' },
  { key: 'packing', label: 'Đang đóng gói', icon: 'check' },
  { key: 'shipping', label: 'Đang vận chuyển', icon: 'truck' },
  { key: 'delivered', label: 'Giao hàng thành công', icon: 'circle' },
];

const statusToStepIndex = (status) => {
  const map = { pending: 0, processing: 2, shipped: 3, delivered: 4 };
  return map[status] ?? 0;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${d.toLocaleDateString('vi-VN')}`;
};

const OrderStatus = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) load();
  }, [orderId]);

  const copyTracking = () => {
    const code = order?.trackingCode || 'GHN992837465VN';
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const currentStep = order ? statusToStepIndex(order.status) : 0;
  const orderCode = order?.orderNumber || `NT${orderId?.slice(-5) || '12345'}`;
  const trackingCode = order?.trackingCode || 'GHN992837465VN';
  const carrierName = order?.carrierName || 'Giao Hàng Nhanh (GHN)';
  const arrivalAddress = order?.recipient?.address || 'Quận 1, TP. HCM';
  const mapUrl = `https://www.google.com/maps/search/?query=${encodeURIComponent(arrivalAddress)}`;

  if (loading) {
    return (
      <div className="order-status-page">
        <div className="order-status-header">
          <button type="button" className="order-status-back" onClick={() => navigate(-1)}>←</button>
          <h1 className="order-status-title">Tình trạng đơn hàng</h1>
          <button type="button" className="order-status-info" aria-label="Thông tin">i</button>
        </div>
        <div className="order-status-loading">Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-status-page">
        <div className="order-status-header">
          <button type="button" className="order-status-back" onClick={() => navigate(-1)}>←</button>
          <h1 className="order-status-title">Tình trạng đơn hàng</h1>
          <button type="button" className="order-status-info" aria-label="Thông tin">i</button>
        </div>
        <div className="order-status-loading">Không tìm thấy đơn hàng</div>
      </div>
    );
  }

  return (
    <div className="order-status-page">
      <header className="order-status-header">
        <button type="button" className="order-status-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="order-status-title">Tình trạng đơn hàng #{orderCode}</h1>
        <button type="button" className="order-status-info" aria-label="Thông tin">i</button>
      </header>

      <main className="order-status-main">
        <section className="order-status-section">
          <h2 className="order-status-section-title">Lộ trình giao hàng</h2>
          <div className="order-status-timeline">
            {TIMELINE_STEPS.map((step, index) => {
              const isDone = index < currentStep;
              const isCurrent = index === currentStep;
              const isPending = index > currentStep;
              return (
                <div key={step.key} className={`order-status-timeline-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}>
                  <div className="order-status-timeline-icon">
                    {step.icon === 'check' && <span className="icon-check">✓</span>}
                    {step.icon === 'truck' && <span className="icon-truck">🚚</span>}
                    {step.icon === 'circle' && <span className="icon-circle" />}
                  </div>
                  <div className="order-status-timeline-content">
                    <p className="order-status-timeline-label">{step.label}</p>
                    {index === 0 && <p className="order-status-timeline-time">{formatDateTime(order.createdAt)}</p>}
                    {index === 1 && <p className="order-status-timeline-time">{order.createdAt ? formatDateTime(new Date(new Date(order.createdAt).getTime() + 30 * 60000)) : '11:00, 20/10/2023'}</p>}
                    {index === 2 && <p className="order-status-timeline-time">{order.updatedAt ? formatDateTime(order.updatedAt) : '14:30, 20/10/2023'}</p>}
                    {index === 3 && (
                      <>
                        <p className="order-status-timeline-location">Tại kho HCM - Quận 7</p>
                        <p className="order-status-timeline-time">Cập nhật: {formatDateTime(order.updatedAt)}</p>
                      </>
                    )}
                    {index === 4 && <p className="order-status-timeline-time">Dự kiến: {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('vi-VN') : '22/10/2023'}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="order-status-section">
          <div className="order-status-map-wrap">
            <iframe
              title="Bản đồ"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=106.68%2C10.76%2C106.72%2C10.80&layer=mapnik&marker=10.78%2C106.70`}
              className="order-status-map"
              allowFullScreen
              loading="lazy"
            />
            <div className="order-status-map-overlay" />
          </div>
          <div className="order-status-map-footer">
            <span className="order-status-map-label">Đang đến: {arrivalAddress}</span>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="order-status-map-link">XEM CHI TIẾT &gt;</a>
          </div>
        </section>

        <section className="order-status-section">
          <h2 className="order-status-section-title">Thông tin vận chuyển</h2>
          <div className="order-status-shipping-card">
            <div className="order-status-shipping-icon">📦</div>
            <div className="order-status-shipping-info">
              <p className="order-status-shipping-name">{carrierName}</p>
              <p className="order-status-shipping-code">{trackingCode}</p>
            </div>
            <button type="button" className="order-status-copy-btn" onClick={copyTracking}>
              <span className="copy-icon">⎘</span>
              <span className="copy-text">{copied ? 'Đã sao chép' : 'Sao chép'}</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="order-status-footer">
        <button type="button" className="order-status-btn order-status-btn-primary" onClick={() => { /* Liên hệ hỗ trợ */ }}>
          <span className="btn-icon">🎧</span>
          Liên hệ hỗ trợ
        </button>
        <button type="button" className="order-status-btn order-status-btn-secondary" onClick={() => navigate(`/order-history`)}>
          <span className="btn-icon">🧾</span>
          Xem hóa đơn
        </button>
      </footer>
    </div>
  );
};

export default OrderStatus;
