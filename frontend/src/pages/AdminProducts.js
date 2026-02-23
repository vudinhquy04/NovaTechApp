import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { productAPI, categoryAPI } from '../services/api';
import { notifyLowStock } from '../utils/notificationUtils';
import '../styles/AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const lowStockNotifiedRef = useRef(new Set()); // Track notified products
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    image: '',
    description: '',
    specifications: '',
    isFeatured: false,
    isHot: false
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      console.log('Products response:', response);
      // API returns { success: true, data: products }
      const productList = response.data || response.products || [];
      setProducts(productList);
      
      // Check for low stock products
      productList.forEach(product => {
        if (product.stock < 10 && product.stock > 0) {
          const productKey = `${product._id}-${product.stock}`;
          if (!lowStockNotifiedRef.current.has(productKey)) {
            notifyLowStock(product.name, product.stock);
            lowStockNotifiedRef.current.add(productKey);
            window.dispatchEvent(new Event('notificationUpdate'));
          }
        }
      });
      
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
        alert('Xóa sản phẩm thành công!');
        fetchProducts();
      } catch (error) {
        alert('Xóa thất bại!');
      }
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      category: '',
      price: '',
      originalPrice: '',
      stock: '',
      image: '',
      description: '',
      specifications: '',
      isFeatured: false,
      isHot: false
    });
    setShowModal(true);
  };

  const handleView = (product) => {
    setViewingProduct(product);
    setShowViewModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      stock: product.stock || '',
      image: product.image || '',
      description: product.description || '',
      specifications: typeof product.specifications === 'object' 
        ? JSON.stringify(product.specifications, null, 2)
        : (product.specifications || ''),
      isFeatured: product.isFeatured || false,
      isHot: product.isHot || false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Parse specifications if it's a JSON string
      let specifications = formData.specifications;
      if (specifications && typeof specifications === 'string') {
        try {
          specifications = JSON.parse(specifications);
        } catch (err) {
          // If not valid JSON, keep as string
        }
      }

      const data = {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        stock: Number(formData.stock),
        specifications
      };

      if (editingProduct) {
        await productAPI.update(editingProduct._id, data);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        await productAPI.create(data);
        alert('Thêm sản phẩm thành công!');
      }
      
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getStatusBadge = (stock) => {
    if (stock === 0) return <span className="status-badge red">Ngưng kinh doanh</span>;
    if (stock < 10) return <span className="status-badge yellow">Sắp hết hàng</span>;
    return <span className="status-badge green">Kinh doanh</span>;
  };

  const filteredProducts = products.filter(p => {
    // Search filter
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchCategory = filterCategory === 'all' || p.category === filterCategory;
    
    // Status filter (based on stock)
    let matchStatus = true;
    if (filterStatus === 'active') matchStatus = p.stock > 0;
    else if (filterStatus === 'inactive') matchStatus = p.stock === 0;
    else if (filterStatus === 'low') matchStatus = p.stock > 0 && p.stock < 10;
    
    // Featured/Hot filter
    let matchFeatured = true;
    if (filterFeatured === 'featured') matchFeatured = p.isFeatured === true;
    else if (filterFeatured === 'hot') matchFeatured = p.isHot === true;
    
    return matchSearch && matchCategory && matchStatus && matchFeatured;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterFeatured('all');
  };

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
                  placeholder="🔍 Tìm kiếm tên, thương hiệu..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  className={`btn-filter ${showFilterPanel ? 'active' : ''}`}
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                >
                  🔽 Bộ lọc
                  {(filterCategory !== 'all' || filterStatus !== 'all' || filterFeatured !== 'all') && (
                    <span className="filter-badge">•</span>
                  )}
                </button>
                <button className="btn-refresh" onClick={fetchProducts}>🔄 Làm mới</button>
                <button className="btn-add" onClick={handleAdd}>+ Thêm mới</button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
              <div className="filter-panel">
                <div className="filter-group">
                  <label>Danh mục</label>
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="all">Tất cả danh mục</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Trạng thái</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">Tất cả</option>
                    <option value="active">Còn hàng</option>
                    <option value="low">Sắp hết hàng</option>
                    <option value="inactive">Hết hàng</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Đặc biệt</label>
                  <select value={filterFeatured} onChange={(e) => setFilterFeatured(e.target.value)}>
                    <option value="all">Tất cả</option>
                    <option value="featured">🌟 Nổi bật</option>
                    <option value="hot">🔥 Hot</option>
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
                          <button className="btn-action view" onClick={() => handleView(product)} title="Xem">👁️</button>
                          <button className="btn-action edit" onClick={() => handleEdit(product)} title="Sửa">✏️</button>
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

        {/* Modal View Product */}
        {showViewModal && viewingProduct && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal-content modal-view" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Chi tiết sản phẩm</h2>
                <button className="modal-close" onClick={() => setShowViewModal(false)}>×</button>
              </div>
              
              <div className="product-detail-view">
                <div className="product-detail-image">
                  <img src={viewingProduct.image} alt={viewingProduct.name} />
                </div>
                
                <div className="product-detail-info">
                  <h3 className="product-detail-name">{viewingProduct.name}</h3>
                  
                  <div className="detail-section">
                    <div className="detail-row">
                      <span className="detail-label">Thương hiệu:</span>
                      <span className="detail-value">{viewingProduct.brand}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Danh mục:</span>
                      <span className="detail-value">{viewingProduct.category}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Giá bán:</span>
                      <span className="detail-value price">{viewingProduct.price?.toLocaleString('vi-VN')}đ</span>
                    </div>
                    {viewingProduct.originalPrice && (
                      <div className="detail-row">
                        <span className="detail-label">Giá gốc:</span>
                        <span className="detail-value original-price">{viewingProduct.originalPrice?.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Tồn kho:</span>
                      <span className="detail-value">{viewingProduct.stock} sản phẩm</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Trạng thái:</span>
                      <span className="detail-value">{getStatusBadge(viewingProduct.stock)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Đánh dấu:</span>
                      <div className="detail-value">
                        {viewingProduct.isFeatured && <span className="badge-tag featured">🌟 Nổi bật</span>}
                        {viewingProduct.isHot && <span className="badge-tag hot">🔥 Hot</span>}
                        {!viewingProduct.isFeatured && !viewingProduct.isHot && <span>Không có</span>}
                      </div>
                    </div>
                  </div>

                  {viewingProduct.description && (
                    <div className="detail-section">
                      <h4>Mô tả sản phẩm</h4>
                      <p className="product-description">{viewingProduct.description}</p>
                    </div>
                  )}

                  {viewingProduct.specifications && (
                    <div className="detail-section">
                      <h4>Thông số kỹ thuật</h4>
                      <pre className="product-specs">
                        {typeof viewingProduct.specifications === 'object' 
                          ? JSON.stringify(viewingProduct.specifications, null, 2)
                          : viewingProduct.specifications}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowViewModal(false)}>
                  Đóng
                </button>
                <button className="btn-save" onClick={() => {
                  setShowViewModal(false);
                  handleEdit(viewingProduct);
                }}>
                  ✏️ Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Add/Edit Product */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Tên sản phẩm *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập tên sản phẩm"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Thương hiệu *</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập thương hiệu"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Danh mục *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>URL hình ảnh *</label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Giá bán *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Giá gốc</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Tồn kho *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Nhập mô tả sản phẩm"
                  />
                </div>

                <div className="form-group">
                  <label>Thông số kỹ thuật (Text hoặc JSON)</label>
                  <textarea
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder='Ví dụ JSON: {"cpu": "M2", "ram": "8GB", "storage": "256GB"}'
                  />
                  <small className="form-hint">Có thể nhập text hoặc JSON object</small>
                </div>

                <div className="form-row">
                  <div className="form-group-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                      />
                      <span>Sản phẩm nổi bật</span>
                    </label>
                  </div>
                  
                  <div className="form-group-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        name="isHot"
                        checked={formData.isHot}
                        onChange={handleInputChange}
                      />
                      <span>Sản phẩm hot</span>
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-save">
                    {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
