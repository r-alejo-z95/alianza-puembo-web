'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Obtiene el usuario logueado unido con su perfil de la tabla pública.
 * Esto permite al Sidebar y Layout conocer los permisos del usuario actual.
 */
export async function getSessionUser() {
  const supabase = await createClient()
  
  // 1. Obtenemos el ID del usuario desde Auth (Supabase maneja esto)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) return null

  // 2. Buscamos en TU tabla 'profiles' los permisos de ese ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.warn('No se encontró perfil para el usuario:', user.id)
    return user
  }

  // 3. Devolvemos un solo objeto con TODO lo necesario
  return {
    ...user,
    full_name: profile.full_name,
    is_super_admin: profile.is_super_admin,
    permissions: {
      perm_events: profile.perm_events,
      perm_news: profile.perm_news,
      perm_lom: profile.perm_lom,
      perm_prayer: profile.perm_prayer,
      perm_forms: profile.perm_forms
    }
  }
}