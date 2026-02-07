import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.log(err);
      alert("Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Đang tải danh mục...</p>;

  return (
    <div>
      <h2>Quản lý danh mục</h2>

      {categories.length === 0 ? (
        <p>Không có danh mục nào</p>
      ) : (
        <table border="1" cellPadding="10" width="100%">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat._id}>
                <td>{index + 1}</td>
                <td>{cat.name}</td>
                <td>{cat.description}</td>
                <td>
                  {new Date(cat.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button>Xem</button>
                  <button>Sửa</button>
                  <button>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CategoryList;
    