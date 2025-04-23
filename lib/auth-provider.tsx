"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { decodeJwt, getAuthToken, type UserJwtPayload, checkPermission } from "./auth-utils"

// Interface para o contexto de autenticação
interface AuthContextType {
  user: UserJwtPayload | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

// Criar o contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}

// Hook para usar permissões
export function usePermission(permission: string): boolean {
  const { user } = useAuth()
  if (!user) return false
  return checkPermission(user.role, permission)
}

// Opções de autenticação
export const authOptions = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.role = token.role
      }
      return session
    },
  },
}

// Provedor de autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserJwtPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se há um token nos cookies
        const token = getAuthToken()

        if (token) {
          // Decodificar o token
          const decoded = decodeJwt(token)

          if (decoded) {
            // Verificar se o token é válido no servidor
            const response = await fetch("/api/auth/me")

            if (response.ok) {
              const data = await response.json()
              setUser(data.user)
            } else {
              // Se o token não for válido, limpar os cookies
              document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
              setUser(null)
            }
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Função para fazer login
  const login = async (username: string, password: string) => {
    try {
      console.log(`AuthProvider: Tentando fazer login com usuário: ${username}`)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      console.log("AuthProvider: Resposta do servidor:", data)

      if (data.success) {
        // Atualizar o estado do usuário
        setUser(data.user)
        console.log("AuthProvider: Login bem-sucedido, usuário definido:", data.user)
        return { success: true }
      } else {
        console.error("AuthProvider: Falha no login:", data.message)
        return { success: false, message: data.message || "Falha na autenticação" }
      }
    } catch (error) {
      console.error("AuthProvider: Erro ao fazer login:", error)
      return { success: false, message: "Erro ao fazer login" }
    }
  }

  // Função para fazer logout
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      // Limpar o estado do usuário
      setUser(null)

      // Redirecionar para a página de login
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  // Função para verificar se o usuário tem uma determinada permissão
  const hasPermission = (permission: string) => {
    if (!user) return false
    return checkPermission(user.role, permission)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>{children}</AuthContext.Provider>
}
