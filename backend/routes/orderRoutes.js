const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   GET /api/orders
// @desc    Get all orders for current user (with optional status filter)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    
    // Filter by status if provided
    if (status && status !== 'all') {
      // Map Vietnamese status to English
      const statusMap = {
        'delivering': 'shipped',
        'delivered': 'delivered',
        'cancelled': 'cancelled',
        'processing': 'processing',
        'pending': 'pending'
      };
      query.status = statusMap[status] || status;
    }
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { cancellationReason, cancellationNotes } = req.body;

    if (!cancellationReason) {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel delivered order' });
    }

    // Update order status
    order.status = 'cancelled';
    order.cancellationReason = cancellationReason;
    order.cancellationNotes = cancellationNotes || null;
    order.cancelledAt = new Date();
    await order.save();

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
