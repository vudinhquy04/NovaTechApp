const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Helper to generate simple order code
const generateOrderCode = () =>
  `NT-${Math.floor(100000 + Math.random() * 900000)}`;

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      items,
      receiverName,
      receiverPhone,
      receiverAddress,
      shippingFee = 0,
      discount = 0,
      paymentMethod = 'VISA',
      paymentMasked,
      isPaid = false,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    const subTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const total = subTotal + shippingFee - discount;

    const order = await Order.create({
      code: generateOrderCode(),
      user: req.user._id,
      receiverName,
      receiverPhone,
      receiverAddress,
      items,
      subTotal,
      shippingFee,
      discount,
      total,
      paymentMethod,
      paymentMasked,
      isPaid,
      paidAt: isPaid ? new Date() : undefined,
      statusHistory: [
        {
          status: 'PLACED',
          label: 'Đặt hàng thành công',
          description: '',
          time: new Date(),
        },
      ],
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get orders of current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order (basic)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const updates = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

