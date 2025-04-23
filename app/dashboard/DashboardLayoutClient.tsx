"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Loader2 } from "lucide-react"
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useSidebar()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isMobile ? 0 : isOpen ? "16rem" : "4rem",
        }}
      >
        <main className="container mx-auto py-6 px-4 md:px-6 mt-12 lg:mt-0">{children}</main>
      </div>
    </div>
  )
}

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  )
}
