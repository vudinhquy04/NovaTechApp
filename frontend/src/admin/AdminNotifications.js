import React, { useEffect, useState } from "react";
import api from "../services/api";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await api.get("/notifications");
    setNotifications(res.data);
  };

  const createNotification = async () => {
    await api.post("/notifications", { title, content });
    setTitle("");
    setContent("");
    fetchNotifications();
  };

  const handleDelete = async (id) => {
    await api.delete(`/notifications/${id}`);
    fetchNotifications();
  };

  return (
    <div className="container-fluid">
      <h4 className="mb-3">Quản lý thông báo</h4>

      <div className="card p-3 mb-3">
        <input
          className="form-control mb-2"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Nội dung"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="btn btn-primary" onClick={createNotification}>
          Tạo thông báo
        </button>
      </div>

      <table className="table table-hover bg-white shadow-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Tiêu đề</th>
            <th>Nội dung</th>
            <th>Ngày</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((n, index) => (
            <tr key={n._id}>
              <td>{index + 1}</td>
              <td>{n.title}</td>
              <td>{n.content}</td>
              <td>{new Date(n.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(n._id)}
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

export default AdminNotifications;
