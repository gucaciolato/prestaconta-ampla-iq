import { type NextRequest, NextResponse } from "next/server"
import { findOne, deleteOne, toObjectId } from "@/lib/mongodb-service"
import { deleteFileById } from "@/lib/gridfs-service"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar a imagem para obter o ID do arquivo
    const imagem = await findOne("galeria", { _id: toObjectId(id) })

    if (!imagem) {
      return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 })
    }

    // Excluir o arquivo associado
    if (imagem.fileId) {
      try {
        await deleteFileById(imagem.fileId)
      } catch (error) {
        console.error(`Erro ao excluir arquivo ${imagem.fileId}:`, error)
        // Continue mesmo se a exclusão do arquivo falhar
      }
    }

    // Excluir a imagem
    const result = await deleteOne("galeria", { _id: toObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Imagem excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir imagem:", error)
    return NextResponse.json({ error: "Erro ao excluir imagem" }, { status: 500 })
  }
}
