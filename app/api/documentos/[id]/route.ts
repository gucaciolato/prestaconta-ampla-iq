import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/postgres-service"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Buscar o documento para obter o ID do arquivo
    const docResult = await query("SELECT * FROM documentos WHERE id = $1", [id])

    if (docResult.rowCount === 0) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 })
    }

    // Excluir o documento
    const result = await query("DELETE FROM documentos WHERE id = $1", [id])

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Documento excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir documento:", error)
    return NextResponse.json({ error: "Erro ao excluir documento" }, { status: 500 })
  }
}
