import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/postgres-service"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Buscar a imagem para obter o ID do arquivo
    const imageResult = await query("SELECT * FROM galeria WHERE id = $1", [id])

    if (imageResult.rowCount === 0) {
      return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 })
    }

    const imagem = imageResult.rows[0]

    // Excluir a imagem
    const result = await query("DELETE FROM galeria WHERE id = $1", [id])

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Imagem excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir imagem:", error)
    return NextResponse.json({ error: "Erro ao excluir imagem" }, { status: 500 })
  }
}
