import React, { useEffect, useState } from "react";
import api from "../services/api";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await api.get("/orders");
    setOrders(res.data);
  };

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}`, { status });
    fetchOrders();
  };

  const softDelete = async (id) => {
    await api.put(`/orders/${id}`, { deleted: true });
    fetchOrders();
  };

  return (
    <div className="container-fluid">
      <h4 className="mb-3">Quản lý đơn hàng</h4>

      <table className="table table-bordered bg-white shadow-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Khách hàng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Ngày</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, index) => (
            <tr key={o._id}>
              <td>{index + 1}</td>
              <td>{o.customerName}</td>
              <td>{o.total.toLocaleString()}đ</td>
              <td>
                <select
                  className="form-select"
                  value={o.status}
                  onChange={(e) => updateStatus(o._id, e.target.value)}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="shipping">Đang giao hàng</option>
                  <option value="done">Đã hoàn tất</option>
                  <option value="cancel">Hủy</option>
                </select>
              </td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => softDelete(o._id)}
                >
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

export default AdminOrders;