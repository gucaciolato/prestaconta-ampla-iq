import { type NextRequest, NextResponse } from "next/server"
import { findOne, deleteOne, toObjectId } from "@/lib/mongodb-service"
import { deleteFileById } from "@/lib/gridfs-service"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar o membro para obter o ID do arquivo
    const membro = await findOne("diretoria", { _id: toObjectId(id) })

    if (!membro) {
      return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 })
    }

    // Excluir o arquivo associado
    if (membro.fileId) {
      try {
        await deleteFileById(membro.fileId)
      } catch (error) {
        console.error(`Erro ao excluir arquivo ${membro.fileId}:`, error)
        // Continue mesmo se a exclusão do arquivo falhar
      }
    }

    // Excluir o membro
    const result = await deleteOne("diretoria", { _id: toObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Membro excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir membro:", error)
    return NextResponse.json({ error: "Erro ao excluir membro" }, { status: 500 })
  }
}
