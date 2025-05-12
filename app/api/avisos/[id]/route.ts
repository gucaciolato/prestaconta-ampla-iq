import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/postgres-service"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`[AVISOS] Iniciando exclusão do aviso com ID: ${params.id}`)

    if (!params.id) {
      console.error("[AVISOS] Tentativa de exclusão sem ID")
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    // Verificar se o ID é um número válido
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      console.error(`[AVISOS] ID inválido: ${params.id}`)
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    console.log(`[AVISOS] Excluindo aviso com ID: ${id}`)
    const result = await query("DELETE FROM avisos WHERE id = $1", [id])
    console.log(`[AVISOS] Resultado da exclusão:`, result.rowCount)

    if (result.rowCount === 0) {
      console.warn(`[AVISOS] Aviso com ID ${id} não encontrado para exclusão`)
      return NextResponse.json({ error: "Aviso not found" }, { status: 404 })
    }

    console.log(`[AVISOS] Aviso com ID ${id} excluído com sucesso`)
    return NextResponse.json({
      success: true,
      message: "Aviso deleted successfully",
    })
  } catch (error) {
    console.error(`[AVISOS] Erro ao excluir aviso:`, error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete aviso",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
