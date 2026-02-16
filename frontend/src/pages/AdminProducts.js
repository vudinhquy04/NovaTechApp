import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { productAPI } from '../services/api';
import '../styles/AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      console.log('Products response:', response);
      // API returns { success: true, data: products }
      const productList = response.data || response.products || [];
      setProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await productAPI.delete(id);
        fetchProducts();
      } catch (error) {
        alert('Xóa thất bại!');
      }
    }
  };

  const getStatusBadge = (stock) => {
    if (stock === 0) return <span className="status-badge red">Ngưng kinh doanh</span>;
    if (stock < 10) return <span className="status-badge yellow">Sắp hết hàng</span>;
    return <span className="status-badge green">Kinh doanh</span>;
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: products.length,
    active: products.filter(p => p.stock > 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
    inactive: products.filter(p => p.stock === 0).length
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <Header title="Quản lý sản phẩm" />
        
        <div className="products-container">
          {/* Stats Cards */}
          <div className="stats-row">
            <div className="stat-card-small blue">
              <div className="stat-icon">📦</div>
              <div>
                <div className="stat-label">TỔNG SẢN PHẨM</div>
                <div className="stat-value">{stats.total}</div>
              </div>
            </div>
            <div className="stat-card-small green">
              <div className="stat-icon">✅</div>
              <div>
                <div className="stat-label">ĐANG KINH DOANH</div>
                <div className="stat-value">{stats.active}</div>
              </div>
            </div>
            <div className="stat-card-small yellow">
              <div className="stat-icon">⚠️</div>
              <div>
                <div className="stat-label">SẮP HẾT HÀNG</div>
                <div className="stat-value">{stats.lowStock}</div>
              </div>
            </div>
            <div className="stat-card-small red">
              <div className="stat-icon">🚫</div>
              <div>
                <div className="stat-label">NGƯNG KINH DOANH</div>
                <div className="stat-value">{stats.inactive}</div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="table-section">
            <div className="table-header">
              <h3>Danh sách sản phẩm <span className="count">({filteredProducts.length} items)</span></h3>
              <div className="table-actions">
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn-filter">🔽 Bộ lọc</button>
                <button className="btn-add">+ Thêm mới</button>
              </div>
            </div>

            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>SẢN PHẨM</th>
                    <th>GIÁ BÁN</th>
                    <th>TỒN KHO</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.slice((currentPage - 1) * 10, currentPage * 10).map((product, index) => (
                    <tr key={product._id}>
                      <td>{(currentPage - 1) * 10 + index + 1}</td>
                      <td>
                        <div className="product-info">
                          <img src={product.image} alt={product.name} className="product-image" />
                          <div>
                            <div className="product-name">{product.name}</div>
                            <div className="product-category">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="price">{product.price?.toLocaleString('vi-VN')}đ</td>
                      <td>{product.stock}</td>
                      <td>{getStatusBadge(product.stock)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-action view" title="Xem">👁️</button>
                          <button className="btn-action edit" title="Sửa">✏️</button>
                          <button className="btn-action delete" onClick={() => handleDelete(product._id)} title="Xóa">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            <div className="pagination">
              <span>Đang hiển thị 1 đến {Math.min(10, filteredProducts.length)} trong số {filteredProducts.length} kết quả</span>
              <div className="pagination-buttons">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>Trước</button>
                <button className="active">{currentPage}</button>
                <button onClick={() => setCurrentPage(currentPage + 1)}>Sau</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
