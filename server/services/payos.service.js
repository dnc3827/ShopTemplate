import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

const PAYOS_CLIENT_ID      = process.env.PAYOS_CLIENT_ID
const PAYOS_API_KEY        = process.env.PAYOS_API_KEY
const PAYOS_CHECKSUM_KEY   = process.env.PAYOS_CHECKSUM_KEY
const PAYOS_API_URL        = 'https://api-merchant.payos.vn'

// Debug startup — kiểm tra env đọc đúng chưa (xóa sau khi fix)
console.log('[PayOS] PAYOS_CLIENT_ID set:', !!PAYOS_CLIENT_ID)
console.log('[PayOS] PAYOS_API_KEY set:', !!PAYOS_API_KEY)
console.log('[PayOS] PAYOS_CHECKSUM_KEY set:', !!PAYOS_CHECKSUM_KEY)
console.log('[PayOS] PAYOS_CHECKSUM_KEY length:', PAYOS_CHECKSUM_KEY?.length ?? 0)

// Multiplier theo gói
const PLAN_MULTIPLIER  = { '1month': 1, '3months': 3, '1year': 12 }
// Giảm thêm theo gói (%)
const PLAN_DISCOUNT    = { '1month': 0, '3months': 15, '1year': 30 }

/**
 * Tính số tiền đơn hàng theo công thức TDD — KHÔNG lưu DB
 * @param {number} basePrice   - Giá gốc template (VNĐ)
 * @param {number} promoPct    - % khuyến mãi (0 nếu không có)
 * @param {'1month'|'3months'|'1year'} plan
 * @returns {number} - Số tiền cuối cùng (đã làm tròn)
 */
export function calculateAmount(basePrice, promoPct, plan) {
  if (!PLAN_MULTIPLIER[plan]) throw new Error(`Invalid plan: ${plan}`)
  const afterPromo   = basePrice * (1 - promoPct / 100)
  const subtotal     = afterPromo * PLAN_MULTIPLIER[plan]
  const finalAmount  = subtotal * (1 - PLAN_DISCOUNT[plan] / 100)
  return Math.round(finalAmount)
}

/**
 * Các field PayOS dùng để tính chữ ký — theo thứ tự alphabet cố định
 * Ref: https://payos.vn/docs/tich-hop-payos/api-tich-hop/
 */
const PAYOS_SIGNATURE_FIELDS = [
  'amount',
  'canceledAt',
  'cancellationReason',
  'code',
  'counterAccountBankId',
  'counterAccountBankName',
  'counterAccountName',
  'counterAccountNumber',
  'currency',
  'description',
  'orderCode',
  'paymentLinkId',
  'reference',
  'transactionDateTime',
  'transferAmount',
  'virtualAccountName',
  'virtualAccountNumber',
]

/**
 * Tạo chuỗi ký theo đúng format PayOS webhook:
 * - Lấy TẤT CẢ keys từ data object (không hardcode)
 * - Sort theo alphabet
 * - Giá trị null/undefined → chuỗi rỗng ""
 * - Join bằng "&"
 * - Tính HMAC-SHA256 với checksumKey
 */
function createWebhookSignature(data) {
  const sortedKeys = Object.keys(data).sort()
  const stringToSign = sortedKeys
    .map(key => {
      const value = data[key]
      return `${key}=${value === null || value === undefined ? '' : value}`
    })
    .join('&')
  const hmac = crypto.createHmac('sha256', PAYOS_CHECKSUM_KEY).update(stringToSign).digest('hex')
  return { sortedKeys, stringToSign, hmac }
}

/**
 * Tạo chữ ký HMAC-SHA256 cho PayOS payment request
 * (Dùng khi tạo đơn hàng — sorted keys, khác với webhook verify)
 */
function createRequestSignature(data) {
  const sortedKeys = Object.keys(data).sort()
  const payload = sortedKeys
    .map(k => `${k}=${data[k]}`)
    .join('&')
  return crypto
    .createHmac('sha256', PAYOS_CHECKSUM_KEY)
    .update(payload)
    .digest('hex')
}

/**
 * Verify HMAC chữ ký từ PayOS webhook
 * @param {object} webhookData - Dữ liệu từ PayOS webhook body
 * @returns {boolean}
 */
export function verifyWebhookSignature(webhookBody) {
  if (!PAYOS_CHECKSUM_KEY) {
    console.error('[PayOS] PAYOS_CHECKSUM_KEY is not set — cannot verify webhook')
    return false
  }

  const receivedSignature = webhookBody.signature
  if (!receivedSignature) {
    console.warn('[PayOS] webhook: no signature in body')
    return false
  }

  // PayOS sign trên object "data" bên trong body, không phải toàn bộ body
  const dataObj = webhookBody.data || webhookBody

  const { sortedKeys, stringToSign, hmac: computedHmac } = createWebhookSignature(dataObj)

  console.log('[PayOS] Raw data object:', JSON.stringify(dataObj, null, 2))
  console.log('[PayOS] Keys used (sorted):', sortedKeys)
  console.log('[PayOS] String to sign:', stringToSign)
  console.log('[PayOS] Computed HMAC:', computedHmac)
  console.log('[PayOS] Received sig: ', receivedSignature)

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHmac, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    )
  } catch (e) {
    console.error('[PayOS] timingSafeEqual error:', e.message)
    return false
  }
}

/**
 * Tạo đơn hàng PayOS và nhận QR code
 * @param {{ orderCode: string, amount: number, description: string, returnUrl: string, cancelUrl: string }} params
 * @returns {{ qrCode: string, payosOrderId: string }}
 */
export async function createPayosOrder({ orderCode, amount, description, returnUrl, cancelUrl }) {
  if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
    throw new Error('PayOS credentials not configured')
  }

  const payload = {
    orderCode: Number(orderCode),
    amount,
    description: description.substring(0, 25), // PayOS giới hạn 25 ký tự
    returnUrl,
    cancelUrl,
  }

  // Tạo signature cho request (dùng sorted keys — khác với webhook)
  const signature = createRequestSignature(payload)

  const response = await fetch(`${PAYOS_API_URL}/v2/payment-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': PAYOS_CLIENT_ID,
      'x-api-key': PAYOS_API_KEY,
    },
    body: JSON.stringify({ ...payload, signature }),
  })

  const data = await response.json()

  if (!response.ok || data.code !== '00') {
    console.error('PayOS createOrder error:', data)
    throw new Error(data.desc || 'PayOS order creation failed')
  }

  return {
    qrCode: data.data?.qrCode,
    payosOrderId: data.data?.paymentLinkId,
    checkoutUrl: data.data?.checkoutUrl,
  }
}

/**
 * Lấy trạng thái đơn từ PayOS (dùng cho polling)
 * @param {string|number} orderCode
 * @returns {{ status: string }}
 */
export async function getPayosOrderStatus(orderCode) {
  const response = await fetch(`${PAYOS_API_URL}/v2/payment-requests/${orderCode}`, {
    headers: {
      'x-client-id': PAYOS_CLIENT_ID,
      'x-api-key': PAYOS_API_KEY,
    },
  })

  const data = await response.json()

  if (!response.ok || data.code !== '00') {
    throw new Error(data.desc || 'Failed to get PayOS order status')
  }

  return { status: data.data?.status }
}
