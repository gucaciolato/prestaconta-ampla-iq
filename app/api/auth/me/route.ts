import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { verifyJWT } from "@/lib/auth-service"

export async function GET(request: NextRequest) {
  try {
    // Obter o token do cookie
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Não autenticado" }, { status: 401 })
    }

    // Verificar o token
    const payload = await verifyJWT(token)

    if (!payload) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    // Retornar os dados do usuário
    return NextResponse.json({
      success: true,
      user: {
        id: payload.id,
        username: payload.username,
        nome: payload.nome,
        email: payload.email,
        role: payload.role,
        ativo: payload.ativo,
      },
    })
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error)
    return NextResponse.json({ success: false, message: "Erro ao verificar autenticação" }, { status: 500 })
  }
}
