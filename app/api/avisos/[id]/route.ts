import { type NextRequest, NextResponse } from "next/server"
import { deleteOne, toObjectId } from "@/lib/mongodb-service"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`[AVISOS] Iniciando exclusão do aviso com ID: ${params.id}`)

    if (!params.id) {
      console.error("[AVISOS] Tentativa de exclusão sem ID")
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 })
    }

    // Tentando converter para ObjectId para validar o formato
    const objectId = toObjectId(params.id)
    console.log(`[AVISOS] ID convertido para ObjectId: ${objectId.toString()}`)

    const result = await deleteOne("avisos", { _id: objectId })
    console.log(`[AVISOS] Resultado da exclusão:`, result)

    if (result.deletedCount === 0) {
      console.warn(`[AVISOS] Aviso com ID ${params.id} não encontrado para exclusão`)
      return NextResponse.json({ error: "Aviso not found" }, { status: 404 })
    }

    console.log(`[AVISOS] Aviso com ID ${params.id} excluído com sucesso`)
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
