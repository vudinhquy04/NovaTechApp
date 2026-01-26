const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, passwordConfirm, address } = req.body;

    if (!fullName || !email || !phone || !password || !passwordConfirm) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ tất cả các trường' 
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu không khớp' 
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email đã được đăng ký' 
      });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Số điện thoại đã được đăng ký' 
      });
    }

    const user = new User({
      fullName,
      email: email.toLowerCase(),
      phone,
      password,
      address: address || ''
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng nhập email và mật khẩu' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không chính xác' 
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

router.get('/me', require('../middleware/authMiddleware').authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Người dùng không tìm thấy' 
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

router.put('/update', require('../middleware/authMiddleware').authenticate, async (req, res) => {
  try {
    const { fullName, phone, address, avatar } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Người dùng không tìm thấy' 
      });
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi cập nhật thông tin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

router.post('/change-password', require('../middleware/authMiddleware').authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mật khẩu mới không khớp' 
      });
    }

    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Người dùng không tìm thấy' 
      });
    }

    const isPasswordValid = await user.matchPassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Mật khẩu hiện tại không chính xác' 
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message 
    });
  }
});

module.exports = router;
