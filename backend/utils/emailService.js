const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send reset code email
const sendResetCodeEmail = async (email, code) => {
  const mailOptions = {
    from: `"NovaTech" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Mã Xác Thực Đặt Lại Mật Khẩu - NovaTech',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #FF6B35;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .code-box {
            background-color: #f5f5f5;
            border: 2px solid #FF6B35;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            color: #FF6B35;
            letter-spacing: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 NovaTech</h1>
            <p>Đặt Lại Mật Khẩu</p>
          </div>
          <div class="content">
            <h2>Xin chào!</h2>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản NovaTech của mình.</p>
            
            <div class="code-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Mã xác thực của bạn là:</p>
              <div class="code">${code}</div>
            </div>
            
            <p>Nhập mã này trong ứng dụng để tiếp tục đặt lại mật khẩu.</p>
            
            <div class="warning">
              <strong>⚠️ Lưu ý:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Mã này có hiệu lực trong <strong>10 phút</strong></li>
                <li>Không chia sẻ mã này với bất kỳ ai</li>
                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này</li>
              </ul>
            </div>
            
            <p>Nếu bạn gặp vấn đề, vui lòng liên hệ với chúng tôi.</p>
            
            <p style="margin-top: 30px;">
              Trân trọng,<br>
              <strong>Đội ngũ NovaTech</strong>
            </p>
          </div>
          <div class="footer">
            <p>Email này được gửi tự động. Vui lòng không trả lời email này.</p>
            <p>&copy; 2026 NovaTech. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendResetCodeEmail };
