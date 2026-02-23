const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Tạo đơn hàng mới (không cần đăng nhập)
router.post('/', async (req, res) => {
  try {
    const {
      orderNumber,
      items,
      customerInfo,
      paymentMethod,
      totalAmount,
      shippingFee,
      finalAmount
    } = req.body;

    // Validate
    if (!orderNumber || !items || items.length === 0 || !customerInfo) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin đơn hàng' 
      });
    }

    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin người nhận' 
      });
    }

    // Tạo đơn hàng
    const order = new Order({
      orderNumber,
      items,
      customerInfo,
      paymentMethod: paymentMethod || 'COD',
      totalAmount,
      shippingFee: shippingFee || 30000,
      finalAmount,
      status: 'pending'
    });

    await order.save();

    res.status(201).json({
      message: 'Đặt hàng thành công',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Mã đơn hàng đã tồn tại' 
      });
    }
    
    res.status(500).json({ 
      message: 'Lỗi server khi tạo đơn hàng',
      error: error.message 
    });
  }
});

// Lấy tất cả đơn hàng (Admin) - Cần xác thực
router.get('/', auth.protect, async (req, res) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filter theo status
    if (status) {
      query.status = status;
    }

    // Search theo orderNumber, tên, SĐT
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.fullName': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('items.product', 'name price image')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi lấy danh sách đơn hàng',
      error: error.message 
    });
  }
});

// Lấy đơn hàng theo ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price image');

    if (!order) {
      return res.status(404).json({ 
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    res.json(order);

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi lấy đơn hàng',
      error: error.message 
    });
  }
});

// Lấy đơn hàng theo số điện thoại (cho mobile app)
router.get('/customer/:phone', async (req, res) => {
  try {
    const orders = await Order.find({ 
      'customerInfo.phone': req.params.phone 
    })
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy đơn hàng',
      error: error.message 
    });
  }
});

// Cập nhật trạng thái đơn hàng (Admin)
router.put('/:id/status', auth.protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'shipping', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        message: 'Trạng thái không hợp lệ' 
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    order.status = status;

    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.isPaid = true;
      order.paidAt = new Date();
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date();
    }

    await order.save();

    res.json({
      message: 'Cập nhật trạng thái thành công',
      order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi cập nhật trạng thái',
      error: error.message 
    });
  }
});

// Hủy đơn hàng
router.put('/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ 
        message: 'Không thể hủy đơn hàng đã giao' 
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ 
        message: 'Đơn hàng đã bị hủy trước đó' 
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason || 'Khách hàng yêu cầu hủy';

    await order.save();

    res.json({
      message: 'Hủy đơn hàng thành công',
      order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi hủy đơn hàng',
      error: error.message 
    });
  }
});

// Thống kê đơn hàng (Admin)
router.get('/stats/summary', auth.protect, async (req, res) => {
  try {
    const [
      total,
      pending,
      processing,
      shipping,
      delivered,
      cancelled
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipping' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' })
    ]);

    // Tính tổng doanh thu từ đơn hàng đã giao
    const revenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    res.json({
      total,
      pending,
      processing,
      shipping,
      delivered,
      cancelled,
      revenue: revenue.length > 0 ? revenue[0].total : 0
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi lấy thống kê',
      error: error.message 
    });
  }
});

module.exports = router;
