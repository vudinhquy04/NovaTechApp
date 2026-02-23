// Utility functions for admin notifications

export const addAdminNotification = (notification) => {
  const storedNotifications = localStorage.getItem('adminNotifications');
  const notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
  
  const newNotification = {
    id: Date.now(),
    read: false,
    time: new Date().toISOString(),
    ...notification
  };
  
  notifications.unshift(newNotification);
  
  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.splice(50);
  }
  
  localStorage.setItem('adminNotifications', JSON.stringify(notifications));
  return newNotification;
};

export const notifyNewOrder = (orderNumber, customerName) => {
  return addAdminNotification({
    type: 'order',
    title: 'Đơn hàng mới',
    message: `Đơn hàng ${orderNumber} từ ${customerName} cần xử lý`
  });
};

export const notifyLowStock = (productName, stock) => {
  return addAdminNotification({
    type: 'product',
    title: 'Cảnh báo tồn kho',
    message: `${productName} chỉ còn ${stock} sản phẩm`
  });
};

export const notifyNewUser = (userName, email) => {
  return addAdminNotification({
    type: 'user',
    title: 'Người dùng mới',
    message: `${userName} (${email}) vừa đăng ký`
  });
};

export const notifyOrderStatusChange = (orderNumber, status) => {
  const statusText = {
    'pending': 'chờ xác nhận',
    'processing': 'đang xử lý',
    'shipping': 'đang giao',
    'delivered': 'đã giao',
    'cancelled': 'đã hủy'
  };
  
  return addAdminNotification({
    type: 'order',
    title: 'Cập nhật đơn hàng',
    message: `Đơn hàng ${orderNumber} đã chuyển sang trạng thái ${statusText[status]}`
  });
};

export const clearAllNotifications = () => {
  localStorage.removeItem('adminNotifications');
};

export const getUnreadCount = () => {
  const storedNotifications = localStorage.getItem('adminNotifications');
  if (!storedNotifications) return 0;
  
  const notifications = JSON.parse(storedNotifications);
  return notifications.filter(n => !n.read).length;
};
