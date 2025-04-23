import { type NextRequest, NextResponse } from "next/server"
import { deactivateUser, activateUser } from "@/lib/auth-service"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação e permissão aqui
    // ...

    const { action } = await request.json()

    if (action === "activate") {
      await activateUser(params.id)
    } else if (action === "deactivate") {
      await deactivateUser(params.id)
    } else {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar status do usuário:", error)
    return NextResponse.json({ error: "Erro ao atualizar status do usuário" }, { status: 500 })
  }
}
