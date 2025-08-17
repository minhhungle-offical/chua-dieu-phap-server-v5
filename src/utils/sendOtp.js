import { transporter } from '../configs/transporter.js'

export async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: '"Chùa Diệu Pháp" <no-reply@chua-dieu-phap.vn>',
    to,
    subject: 'Mã OTP xác thực đăng nhập - Chùa Diệu Pháp',
    text: `Kính gửi quý Phật tử,

    Mã OTP xác thực đăng nhập của quý vị là: ${otp}

    Mã này có hiệu lực trong 5 phút. Nếu quý vị không yêu cầu mã này, vui lòng bỏ qua email.

    Chúc quý Phật tử an lạc và hạnh phúc.

    Trân trọng,
    Chùa Diệu Pháp
    `,
    html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #2e7d32;">Chùa Diệu Pháp</h2>
      <p>Kính gửi quý Phật tử,</p>
      <p>Mã <strong>OTP xác thực đăng nhập</strong> của quý vị là:</p>
      <p style="font-size: 28px; font-weight: bold; color: #388e3c; letter-spacing: 4px;">${otp}</p>
      <p>Mã này có hiệu lực trong <strong>5 phút</strong>. Nếu quý vị không yêu cầu mã này, vui lòng bỏ qua email.</p>
      <hr style="border: none; border-top: 1px solid #ddd;" />
      <p>Chúc quý Phật tử an lạc và hạnh phúc.</p>
      <p style="font-style: italic; color: #555;">Trân trọng,<br/>Chùa Diệu Pháp</p>
    </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
