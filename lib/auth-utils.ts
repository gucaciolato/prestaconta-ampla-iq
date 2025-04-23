"use client"

import { jwtDecode } from "jwt-decode"

// Interface para o payload do JWT
export interface UserJwtPayload {
  id: string
  username: string
  nome: string
  email?: string
  role: string
  ativo: boolean
  exp?: number
}

// Função para decodificar um token JWT no cliente
export function decodeJwt(token: string): UserJwtPayload | null {
  try {
    return jwtDecode<UserJwtPayload>(token)
  } catch (error) {
    console.error("Erro ao decodificar token:", error)
    return null
  }
}

// Função para verificar se um token JWT está expirado
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token)
  if (!decoded || !decoded.exp) return true

  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

// Função para obter o token JWT dos cookies no cliente
export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=")
    if (name === "auth-token") {
      return decodeURIComponent(value)
    }
  }
  return null
}

// Função para verificar se o usuário tem uma determinada permissão
export function checkPermission(userRole: string, permission: string): boolean {
  // Mapeamento de papéis para permissões
  const rolePermissions: Record<string, string[]> = {
    admin: ["*"], // Admin tem todas as permissões
    editor: [
      "dashboard:view",
      "avisos:manage",
      "galeria:manage",
      "documentos:manage",
      "diretoria:manage",
      "relatorios:manage",
      "atividades:manage",
    ],
    viewer: [
      "dashboard:view",
      "avisos:view",
      "galeria:view",
      "documentos:view",
      "diretoria:view",
      "relatorios:view",
      "atividades:view",
    ],
  }

  const userPermissions = rolePermissions[userRole] || []

  // Se o usuário tem a permissão "*", ele tem todas as permissões
  if (userPermissions.includes("*")) return true

  // Verificar se o usuário tem a permissão específica
  return userPermissions.includes(permission)
}
