import { supabaseAdmin } from '../lib/supabase.js'

/**
 * Lấy promotion đang active tại thời điểm hiện tại
 * Trả về null nếu không có promotion nào đang chạy
 */
export async function getActivePromotion() {
  const now = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('promotions')
    .select('id, discount_pct, starts_at, ends_at')
    .eq('is_active', true)
    .lte('starts_at', now)
    .gte('ends_at', now)
    .single()

  if (error || !data) return null
  return data
}
