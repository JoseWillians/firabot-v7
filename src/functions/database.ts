import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function saveLog(jid: string, name: string, command: string) {
  const { error } = await supabase
    .from('logs')
    .insert([{ user_jid: jid, push_name: name, command: command }])
  
  if (error) console.error('❌ [BANCO] Erro ao salvar log:', error.message)
}

export async function setUserState(jid: string, menu: string) {
  const { error } = await supabase
    .from('users')
    .upsert({ user_jid: jid, last_menu: menu, updated_at: new Date() })
  if (error) console.error('❌ [ERRO ESTADO]:', error.message)
}

export async function getUserState(jid: string) {
  const { data, error } = await supabase
    .from('users')
    .select('last_menu, updated_at')
    .eq('user_jid', jid)
    .single()

  if (error || !data) return 'main'

  // Lógica de Expiração (Ex: 30 minutos)
  const lastUpdate = new Date(data.updated_at).getTime()
  const now = new Date().getTime()
  const diffInMinutes = (now - lastUpdate) / (1000 * 60)

  if (diffInMinutes > 30) {
    // Se passou de 30 min, força o retorno ao main
    await setUserState(jid, 'main')
    return 'main'
  }

  return data.last_menu
}