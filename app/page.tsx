"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // User is authenticated, redirect to dashboard
          router.push("/dashboard")
        } else {
          // No user, redirect to login
          router.push("/auth/login")
        }
      } catch (err) {
        console.error("[v0] Auth check error:", err)
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [supabase, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
