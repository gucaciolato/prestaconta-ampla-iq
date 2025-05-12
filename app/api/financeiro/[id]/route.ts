import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/postgres-service"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Excluir o registro financeiro
    const result = await query("DELETE FROM financeiro WHERE id = $1", [id])

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Registro financeiro não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Registro financeiro excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir registro financeiro:", error)
    return NextResponse.json({ error: "Erro ao excluir registro financeiro" }, { status: 500 })
  }
}
