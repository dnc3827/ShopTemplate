import dotenv from 'dotenv'
dotenv.config()

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = 'onboarding@resend.dev'

if (!RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not set — emails will not be sent')
}

/**
 * Gửi email OTP qua Resend API
 * @param {string} to     - Địa chỉ email nhận
 * @param {string} code   - Mã OTP 6 số
 */
export async function sendOtpEmail(to, code) {
  if (!RESEND_API_KEY) {
    console.warn(`[DEV] OTP for ${to}: ${code}`)
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Mã OTP đặt lại mật khẩu PhanMemMau',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #61892F;">PhanMemMau</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Dùng mã OTP bên dưới:</p>
          <div style="
            background: #f4f4f4;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #222629;
          ">
            ${code}
          </div>
          <p style="color: #888; margin-top: 16px;">
            Mã có hiệu lực trong <strong>3 phút</strong>.
            Nếu bạn không yêu cầu, hãy bỏ qua email này.
          </p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${error}`)
  }
}

/**
 * Gửi email thông báo mua hàng thành công
 * @param {string} to          - Email người mua
 * @param {string} templateName - Tên template đã mua
 * @param {string} appUrl       - Link truy cập ứng dụng
 */
export async function sendPurchaseEmail(to, templateName, appUrl) {
  if (!RESEND_API_KEY) {
    console.warn(`[DEV] Purchase email for ${to}: template=${templateName}, appUrl=${appUrl}`)
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject: `Bạn đã mua thành công ${templateName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; background: #121619; color: #fff; padding: 32px; border-radius: 12px;">
          <h2 style="color: #86C232; margin-bottom: 8px;">PhanMemMau</h2>
          <h3 style="color: #fff; margin-bottom: 16px;">Đặt hàng thành công!</h3>
          <p style="color: #A0A4A8;">Cảm ơn bạn đã mua <strong style="color: #fff;">${templateName}</strong>. Dưới đây là link truy cập ứng dụng của bạn:</p>
          ${appUrl ? `
          <div style="margin: 24px 0; text-align: center;">
            <a href="${appUrl}" target="_blank" style="
              display: inline-block;
              background: #61892F;
              color: #fff;
              padding: 14px 32px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
            ">Truy cập ứng dụng ngay →</a>
          </div>
          <p style="color: #6B6E70; font-size: 13px; word-break: break-all;">Hoặc copy link: ${appUrl}</p>
          ` : ''}
          <hr style="border-color: #333; margin: 24px 0;" />
          <p style="color: #6B6E70; font-size: 12px;">
            Bạn đã sở hữu vĩnh viễn template này. 
            Truy cập <a href="https://phanmemmau.com/tai-khoan" style="color: #86C232;">trang tài khoản</a> để quản lý ứng dụng của bạn.
          </p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`sendPurchaseEmail error: ${error}`)
    // Không throw — email thất bại không nên block order
  }
}
