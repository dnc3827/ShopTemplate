import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) throw new Error('SUPABASE_URL is required')
if (!supabaseAnonKey) throw new Error('SUPABASE_ANON_KEY is required')
if (!supabaseServiceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')

// Client dùng cho auth operations (anon key)
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

// Client dùng cho DB queries với đặc quyền cao (service role key)
// Không bao giờ expose client này ra phía frontend
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
