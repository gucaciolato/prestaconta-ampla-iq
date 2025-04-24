import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas que requerem autenticação
const protectedRoutes = [
  "/dashboard",
]

// API routes que requerem autenticação para todos os métodos
const protectedApiRoutes = [
  "/api/usuarios",
]

// API routes que permitem GET requests sem autenticação
const apiRoutesWithGetAccess = [
  "/api/avisos",
  "/api/galeria",
  "/api/documentos",
  "/api/diretoria",
  "/api/relatorios",
  "/api/financeiro",
  "/api/atividades",
]

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

// Função para verificar se o usuário tem uma determinada permissão
function hasPermission(userRole: string, permission: string): boolean {
  const userPermissions = rolePermissions[userRole] || []

  // Se o usuário tem a permissão "*", ele tem todas as permissões
  if (userPermissions.includes("*")) return true

  // Verificar se o usuário tem a permissão específica
  return userPermissions.includes(permission)
}

// Função para verificar um token JWT
async function verifyJWT(token: string) {
  try {
    // Implementação simplificada para o middleware
    // Decodifica o token sem verificar a assinatura
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  // Verificar se é uma API request com GET permitido
  const isApiRouteWithGetAccess = apiRoutesWithGetAccess.some((route) => pathname.startsWith(route))
  if (isApiRouteWithGetAccess && method === "GET") {
    // Permitir acesso a GET requests nas APIs listadas
    return NextResponse.next()
  }

  // Verificar se a rota requer autenticação
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isProtectedApiRoute = protectedApiRoutes.some((route) => pathname.startsWith(route))
  // Outras rotas da API com métodos não-GET também são protegidas
  const isProtectedNonGetApi = apiRoutesWithGetAccess.some((route) => pathname.startsWith(route)) && method !== "GET"

  if (isProtectedRoute || isProtectedApiRoute || isProtectedNonGetApi) {
    // Obter o token JWT dos cookies
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      // Redirecionar para a página de login se não houver token
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    // Verificar o token JWT
    const payload = await verifyJWT(token)

    if (!payload) {
      // Redirecionar para a página de login se o token for inválido
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    // Verificar se o usuário está ativo
    if (!payload.ativo) {
      // Redirecionar para a página de login se o usuário estiver inativo
      const url = new URL("/login", request.url)
      url.searchParams.set("error", "Usuário inativo")
      return NextResponse.redirect(url)
    }

    // Verificar permissões para rotas específicas
    if (pathname.startsWith("/dashboard/usuarios") && !hasPermission(payload.role, "usuarios:manage")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (pathname.startsWith("/dashboard/financeiro") && !hasPermission(payload.role, "financeiro:manage")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Adicione outras verificações de permissão conforme necessário
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}
