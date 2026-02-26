import React, { useEffect, useState } from "react";
import api from "../services/api";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa sản phẩm này?")) {
      await api.delete(`/products/${id}`);
      fetchProducts();
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between mb-3">
        <h4>Quản lý sản phẩm</h4>
        <button className="btn btn-primary">+ Thêm mới</button>
      </div>

      <input
        className="form-control mb-3"
        placeholder="Tìm kiếm sản phẩm..."
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="table table-hover bg-white shadow-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Sản phẩm</th>
            <th>Giá</th>
            <th>Tồn kho</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, index) => (
            <tr key={p._id}>
              <td>{index + 1}</td>
              <td>{p.name}</td>
              <td>{p.price.toLocaleString()}đ</td>
              <td>{p.stock}</td>
              <td>
                <span className={`badge ${
                  p.status === "active" ? "bg-success" :
                  p.status === "out" ? "bg-warning" :
                  "bg-danger"
                }`}>
                  {p.status}
                </span>
              </td>
              <td>
                <button className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(p._id)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;