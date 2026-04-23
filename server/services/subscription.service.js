import { supabaseAdmin } from '../lib/supabase.js'

/**
 * Tính trạng thái subscription động — KHÔNG lưu DB
 * @param {string|null} expires_at
 * @returns {{ status: 'active'|'expiring'|'grace'|'locked', allowed: boolean, days: number|null }}
 */
export function getSubscriptionStatus(expires_at) {
  // Subscription vĩnh viễn (không có ngày hết hạn)
  if (!expires_at) return { status: 'active', allowed: true, days: null }

  const now = new Date()
  const exp = new Date(expires_at)
  const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24))

  if (days > 7)  return { status: 'active',   allowed: true,  days }
  if (days > 0)  return { status: 'expiring', allowed: true,  days }
  if (days >= -3) return { status: 'grace',   allowed: false, days: Math.abs(days) }
  return               { status: 'locked',   allowed: false, days: 0 }
}

/**
 * Lấy subscription của user cho một template
 * @param {string} userId
 * @param {string} templateId
 */
export async function getUserSubscription(userId, templateId) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('id, expires_at, is_active, created_at, updated_at')
    .eq('user_id', userId)
    .eq('template_id', templateId)
    .single()

  if (error || !data) return null
  return data
}
