import { type NextRequest, NextResponse } from "next/server"
import { createUser, getAllUsers } from "@/lib/auth-service"
import { initializeUsers } from "@/lib/auth-service"

// Inicializa os usuários quando o servidor inicia
initializeUsers().catch(console.error)

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e permissão aqui
    // ...

    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e permissão aqui
    // ...

    const userData = await request.json()

    // Validar dados
    if (!userData.username || !userData.password || !userData.nome || !userData.role) {
      return NextResponse.json(
        { error: "Dados incompletos. Username, senha, nome e papel são obrigatórios." },
        { status: 400 },
      )
    }

    const newUser = await createUser(userData)
    return NextResponse.json(newUser)
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error)

    if (error.message === "Nome de usuário já existe") {
      return NextResponse.json({ error: "Nome de usuário já existe" }, { status: 409 })
    }

    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}
