import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/postgres-service"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Buscar a atividade para verificar se existe
    const atividadeResult = await query("SELECT * FROM atividades WHERE id = $1", [id])

    if (atividadeResult.rowCount === 0) {
      return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 })
    }

    // Iniciar transação
    await query("BEGIN")

    try {
      // Excluir fotos associadas
      await query("DELETE FROM atividades_fotos WHERE atividade_id = $1", [id])

      // Excluir a atividade
      const result = await query("DELETE FROM atividades WHERE id = $1", [id])

      await query("COMMIT")

      return NextResponse.json({ success: true, message: "Atividade excluída com sucesso" })
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Erro ao excluir atividade:", error)
    return NextResponse.json({ error: "Erro ao excluir atividade" }, { status: 500 })
  }
}
