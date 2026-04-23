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
      subject: 'Mã OTP đặt lại mật khẩu ShopTemplate',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #61892F;">ShopTemplate</h2>
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
