import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OrderDetail.css';

const OrderDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="order-page">
      <header className="order-header">
        <button className="order-back" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>Chi tiết đơn hàng</h1>
        <button className="order-help">?</button>
      </header>

      <main className="order-main">
        <div className="order-code">
          <span>Mã đơn:</span>
          <strong>#NT-99283001</strong>
        </div>

        <section className="order-card">
          <h2>Trạng thái đơn hàng</h2>
          <div className="order-timeline">
            <div className="timeline-item active">
              <div className="dot" />
              <div>
                <p className="title">Đặt hàng thành công</p>
                <p className="time">10:30, 20/05/2024</p>
              </div>
            </div>
            <div className="timeline-item active">
              <div className="dot" />
              <div>
                <p className="title">Đang chuẩn bị hàng</p>
                <p className="time">14:15, 20/05/2024</p>
              </div>
            </div>
            <div className="timeline-item current">
              <div className="dot" />
              <div>
                <p className="title">Đang giao hàng</p>
                <p className="time">
                  Đã rời kho phân loại lúc 08:00, 21/05
                </p>
              </div>
            </div>
            <div className="timeline-item muted">
              <div className="dot" />
              <div>
                <p className="title">Giao hàng dự kiến</p>
                <p className="time">Dự kiến 22/05/2024</p>
              </div>
            </div>
          </div>
        </section>

        <section className="order-card">
          <h2>Thông tin nhận hàng</h2>
          <div className="order-shipping">
            <div className="text">
              <p className="name">Nguyễn Văn An</p>
              <p className="phone">090 123 4567</p>
              <p className="address">
                123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh
              </p>
            </div>
            <div className="map-box">Bản đồ</div>
          </div>
        </section>

        <section className="order-card">
          <h2>Sản phẩm (2)</h2>
          <div className="order-product">
            <div className="thumb" />
            <div className="info">
              <p className="name">NovaTech Wireless Pro Gen 2</p>
              <p className="variant">Màu sắc: Midnight Silver</p>
              <div className="meta">
                <span>Số lượng: x1</span>
                <span className="price">4.290.000₫</span>
              </div>
            </div>
          </div>
          <div className="order-product">
            <div className="thumb" />
            <div className="info">
              <p className="name">Bàn phím cơ NovaTech K7 Slim</p>
              <p className="variant">Switch: Brown Silent</p>
              <div className="meta">
                <span>Số lượng: x1</span>
                <span className="price">1.850.000₫</span>
              </div>
            </div>
          </div>
        </section>

        <section className="order-card">
          <h2>Chi tiết thanh toán</h2>
          <div className="order-row">
            <span>Tạm tính</span>
            <span>6.140.000₫</span>
          </div>
          <div className="order-row">
            <span>Phí vận chuyển</span>
            <span>35.000₫</span>
          </div>
          <div className="order-row">
            <span>Khuyến mãi</span>
            <span className="discount">-150.000₫</span>
          </div>
          <hr />
          <div className="order-row total">
            <span>Tổng cộng</span>
            <span>6.025.000₫</span>
          </div>
          <p className="note">
            Đã thanh toán qua Thẻ tín dụng (VISA ***4423)
          </p>
        </section>
      </main>

      <footer className="order-footer">
        <button className="btn-secondary">Hủy đơn hàng</button>
        <button className="btn-primary">Đánh giá sản phẩm</button>
      </footer>
    </div>
  );
};

export default OrderDetail;

