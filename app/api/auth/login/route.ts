import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { authenticateUser } from "@/lib/auth-service"

export async function POST(request: NextRequest) {
  try {
    console.log("API Login: Recebendo solicitação de login")

    // Verificar se o corpo da requisição é válido
    let body
    try {
      body = await request.json()
      console.log("API Login: Corpo da requisição recebido")
    } catch (error) {
      console.error("API Login: Erro ao analisar o corpo da requisição:", error)
      return NextResponse.json({ success: false, message: "Corpo da requisição inválido" }, { status: 400 })
    }

    const { username, password } = body
    console.log(`API Login: Tentando autenticar usuário: ${username}`)

    // Validar os dados de entrada
    if (!username || !password) {
      console.log("API Login: Nome de usuário ou senha não fornecidos")
      return NextResponse.json({ success: false, message: "Nome de usuário e senha são obrigatórios" }, { status: 400 })
    }

    // Autenticar o usuário
    console.log(`API Login: Chamando função authenticateUser para ${username}`)
    const result = await authenticateUser(username, password)
    console.log(`API Login: Resultado da autenticação: ${result.success ? "Sucesso" : "Falha"}`)

    if (!result.success) {
      console.log(`API Login: Falha na autenticação: ${result.message}`)
      return NextResponse.json({ success: false, message: result.message }, { status: 401 })
    }

    // Retornar os dados do usuário
    console.log("API Login: Autenticação bem-sucedida, retornando dados do usuário")
    return NextResponse.json({
      success: true,
      user: result.user,
    })
  } catch (error) {
    console.error("API Login: Erro ao fazer login:", error)
    return NextResponse.json({ success: false, message: "Erro ao fazer login" }, { status: 500 })
  }
}
