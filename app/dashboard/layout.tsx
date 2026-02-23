'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardContent from '@/components/dashboard/dashboard-content'
import { Button } from '@/components/ui/button'
import { LogOutIcon } from 'lucide-react'

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [assignedCustomers, setAssignedCustomers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        setUser(user)

        // Fetch assigned customers for this user
        const { data: assignments, error } = await supabase
          .from('user_customer_assignments')
          .select('customer_account')
          .eq('user_id', user.id)

        if (error) {
          console.error('[v0] Error fetching assignments:', error)
        } else {
          const customers = assignments?.map((a) => a.customer_account) || []
          setAssignedCustomers(customers)
          console.log('[v0] Assigned customers:', customers)
        }
      } catch (err) {
        console.error('[v0] Auth error:', err)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with logout */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Invoice Collection Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Logged in as: {user?.email}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Dashboard content */}
      <main className="p-6">
        <DashboardContent 
          assignedCustomers={assignedCustomers}
          userEmail={user?.email}
        />
      </main>
    </div>
  )
}
