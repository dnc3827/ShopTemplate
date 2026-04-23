import { supabaseAdmin } from '../lib/supabase.js'
import { sendOtpEmail } from './email.service.js'
import crypto from 'crypto'

const OTP_LENGTH = 6
const OTP_EXPIRES_MINUTES = 3
const MAX_ATTEMPTS = 5

/**
 * Tạo mã OTP ngẫu nhiên 6 số
 */
function generateCode() {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Tạo OTP mới cho email
 * ⚠️ Hủy tất cả OTP cũ chưa dùng của email này TRƯỚC khi tạo mới
 */
export async function createOtp(email) {
  // Bước 1: Hủy tất cả OTP cũ còn hiệu lực của email này
  const { error: cancelError } = await supabaseAdmin
    .from('otp_codes')
    .update({ is_used: true })
    .eq('email', email)
    .eq('is_used', false)

  if (cancelError) {
    console.error('createOtp cancel old OTPs error:', cancelError)
    throw new Error('Failed to invalidate old OTP codes')
  }

  // Bước 2: Tạo mã mới
  const code = generateCode()
  const expires_at = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000).toISOString()

  const { error: insertError } = await supabaseAdmin
    .from('otp_codes')
    .insert({ email, code, expires_at })

  if (insertError) {
    console.error('createOtp insert error:', insertError)
    throw new Error('Failed to create OTP')
  }

  // Bước 3: Gửi email
  await sendOtpEmail(email, code)
}

/**
 * Verify OTP và đổi mật khẩu
 * - Kiểm tra OTP còn hiệu lực, chưa dùng, chưa quá số lần sai
 * - Tối đa MAX_ATTEMPTS lần sai → hủy mã
 * - Đánh dấu is_used sau khi verify thành công
 *
 * @param {string} email
 * @param {string} code
 * @param {string} newPassword
 * @returns {{ success: boolean, error?: string, attemptsLeft?: number }}
 */
export async function verifyOtp(email, code, newPassword) {
  const now = new Date().toISOString()

  // Lấy OTP mới nhất chưa dùng của email
  const { data: otp, error: fetchError } = await supabaseAdmin
    .from('otp_codes')
    .select('id, code, expires_at, attempts')
    .eq('email', email)
    .eq('is_used', false)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (fetchError || !otp) {
    return { success: false, error: 'OTP không tồn tại hoặc đã hết hạn' }
  }

  // Kiểm tra đã quá số lần sai
  if (otp.attempts >= MAX_ATTEMPTS) {
    // Hủy luôn OTP này
    await supabaseAdmin
      .from('otp_codes')
      .update({ is_used: true })
      .eq('id', otp.id)
    return { success: false, error: 'OTP đã bị khóa do sai quá nhiều lần. Vui lòng gửi lại.' }
  }

  // Sai mã
  if (otp.code !== code) {
    const newAttempts = otp.attempts + 1

    // Nếu đạt max → hủy OTP
    if (newAttempts >= MAX_ATTEMPTS) {
      await supabaseAdmin
        .from('otp_codes')
        .update({ attempts: newAttempts, is_used: true })
        .eq('id', otp.id)
      return { success: false, error: 'Sai mã OTP. Mã đã bị hủy. Vui lòng gửi lại.' }
    }

    // Chưa đạt max → tăng attempts
    await supabaseAdmin
      .from('otp_codes')
      .update({ attempts: newAttempts })
      .eq('id', otp.id)

    const attemptsLeft = MAX_ATTEMPTS - newAttempts
    return { success: false, error: `Sai mã OTP. Còn ${attemptsLeft} lần thử.`, attemptsLeft }
  }

  // Đúng mã → đổi mật khẩu
  const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(
    // Tìm user_id từ email
    await getUserIdByEmail(email),
    { password: newPassword }
  )

  if (pwError) {
    console.error('verifyOtp updatePassword error:', pwError)
    return { success: false, error: 'Không thể đổi mật khẩu. Vui lòng thử lại.' }
  }

  // Đánh dấu OTP đã dùng
  await supabaseAdmin
    .from('otp_codes')
    .update({ is_used: true })
    .eq('id', otp.id)

  return { success: true }
}

/**
 * Lấy user_id từ email thông qua Supabase admin
 */
async function getUserIdByEmail(email) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) throw new Error('Cannot list users')
  const user = (data?.users || []).find(u => u.email === email)
  if (!user) throw new Error(`User not found: ${email}`)
  return user.id
}
