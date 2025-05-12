import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas que requerem autenticação para todas as operações
const fullyProtectedRoutes = ["/dashboard", "/api/usuarios"]

// Rotas que permitem acesso público para GET, mas requerem autenticação para outras operações
const partiallyProtectedRoutes = [
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
    console.error("Erro ao verificar JWT:", error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  console.log(`[MIDDLEWARE] Processando requisição: ${method} ${pathname}`)

  // Verificar se a rota requer autenticação total
  const isFullyProtected = fullyProtectedRoutes.some((route) => pathname.startsWith(route))

  // Verificar se a rota requer autenticação parcial (apenas para métodos não-GET)
  const isPartiallyProtected = partiallyProtectedRoutes.some((route) => pathname.startsWith(route))

  // Permitir acesso público para GET em rotas parcialmente protegidas
  if (isPartiallyProtected && method === "GET") {
    console.log(`[MIDDLEWARE] Permitindo acesso público para GET em ${pathname}`)
    return NextResponse.next()
  }

  // Verificar se a rota requer autenticação
  if (isFullyProtected || isPartiallyProtected) {
    console.log(`[MIDDLEWARE] Rota protegida: ${pathname}, método: ${method}`)

    // Obter o token JWT dos cookies
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      console.log(`[MIDDLEWARE] Token não encontrado, redirecionando para login`)
      // Redirecionar para a página de login se não houver token
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    // Verificar o token JWT
    const payload = await verifyJWT(token)

    if (!payload) {
      console.log(`[MIDDLEWARE] Token inválido, redirecionando para login`)
      // Redirecionar para a página de login se o token for inválido
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    // Verificar se o usuário está ativo
    if (!payload.ativo) {
      console.log(`[MIDDLEWARE] Usuário inativo, redirecionando para login`)
      // Redirecionar para a página de login se o usuário estiver inativo
      const url = new URL("/login", request.url)
      url.searchParams.set("error", "Usuário inativo")
      return NextResponse.redirect(url)
    }

    // Verificar permissões para rotas específicas
    if (pathname.startsWith("/dashboard/usuarios") && !hasPermission(payload.role, "usuarios:manage")) {
      console.log(`[MIDDLEWARE] Acesso negado para ${pathname}, redirecionando para dashboard`)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (pathname.startsWith("/dashboard/financeiro") && !hasPermission(payload.role, "financeiro:manage")) {
      console.log(`[MIDDLEWARE] Acesso negado para ${pathname}, redirecionando para dashboard`)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Adicione outras verificações de permissão conforme necessário
  }

  console.log(`[MIDDLEWARE] Permitindo acesso para ${pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}
