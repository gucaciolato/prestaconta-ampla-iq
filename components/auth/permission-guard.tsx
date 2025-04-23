"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-provider"
import type { Permission } from "@/lib/types"
import { useRouter } from "next/navigation"

interface PermissionGuardProps {
  permission: keyof Permission
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { hasPermission, loading } = useAuth()
  const router = useRouter()

  // Se ainda estiver carregando, não renderiza nada
  if (loading) {
    return null
  }

  // Se o usuário tem permissão, renderiza o conteúdo
  if (hasPermission(permission)) {
    return <>{children}</>
  }

  // Se não tem permissão e existe um fallback, renderiza o fallback
  if (fallback) {
    return <>{fallback}</>
  }

  // Se não tem permissão e não existe fallback, redireciona para o dashboard
  router.push("/dashboard")
  return null
}
