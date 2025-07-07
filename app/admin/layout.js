import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth/getSessionUser'
import AdminSidebar from '@/components/admin/layout/AdminSidebar'

export default async function AdminLayout({ children }) {
  const user = await getSessionUser()

  if (!user) {
    redirect('/')
  }

  return (
    <AdminSidebar user={user}>
      {children}
    </AdminSidebar>
  )
}
