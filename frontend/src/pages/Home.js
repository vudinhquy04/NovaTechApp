import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const featuredProducts = [
  {
    id: '1',
    name: 'Laptop ASUS Vivobook 16 i5...',
    price: '15.000.000 vnd',
    oldPrice: '20.000.000 vnd',
    rating: '5/5',
    sold: 'Đã bán 1k+',
  },
  {
    id: '2',
    name: 'Laptop Dell Inspiron 15 Business Edition',
    price: '15.000.000 vnd',
    oldPrice: '20.000.000 vnd',
    rating: '5/5',
    sold: 'Đã bán 1k+',
  },
  {
    id: '3',
    name: 'Apple MacBook Air M2 13-inch Midnight',
    price: '15.000.000 vnd',
    oldPrice: '20.000.000 vnd',
    rating: '5/5',
    sold: 'Đã bán 1k+',
  },
  {
    id: '4',
    name: 'Laptop Lenovo Yoga Slim 7i Pro',
    price: '15.000.000 vnd',
    oldPrice: '20.000.000 vnd',
    rating: '5/5',
    sold: 'Đã bán 1k+',
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-search">
          <input
            type="text"
            placeholder="Nhập từ khoá tìm kiếm"
            className="home-search-input"
          />
        </div>
        <button className="home-menu-btn">
          <span />
          <span />
          <span />
        </button>
      </header>

      <main className="home-main">
        <section className="home-banner">
          <div className="home-banner-text">
            <h2>MUA CÁ LỚN</h2>
            <p>Bằng cá bé - Siêu tiết kiệm!</p>
            <button className="home-banner-cta">XEM NGAY</button>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-header">
            <h3>SẢN PHẨM NỔI BẬT</h3>
            <button className="home-link">Tất cả</button>
          </div>

          <div className="home-products-grid">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                className="home-product-card"
                onClick={() => navigate('/orders/demo')}
              >
                <div className="home-discount-badge">-25%</div>
                <div className="home-product-image" />
                <div className="home-product-info">
                  <h4>{p.name}</h4>
                  <p className="home-product-price">{p.price}</p>
                  <p className="home-product-old-price">{p.oldPrice}</p>
                  <div className="home-product-meta">
                    <span>★ {p.rating}</span>
                    <span>{p.sold}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="home-bottom-nav">
        <button className="home-bottom-item active">Trang chủ</button>
        <button className="home-bottom-item">Danh mục</button>
        <button className="home-bottom-item">Giỏ hàng</button>
        <button
          className="home-bottom-item"
          onClick={() => navigate('/dashboard')}
        >
          Tài khoản
        </button>
      </footer>
    </div>
  );
};

export default Home;

