import { type NextRequest, NextResponse } from "next/server"
import { findOne, deleteOne, toObjectId } from "@/lib/mongodb-service"
import { deleteFileById } from "@/lib/gridfs-service"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar a atividade para obter os IDs dos arquivos
    const atividade = await findOne("atividades", { _id: toObjectId(id) })

    if (!atividade) {
      return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 })
    }

    // Excluir arquivos associados
    if (atividade.fotos && Array.isArray(atividade.fotos)) {
      for (const foto of atividade.fotos) {
        if (foto.fileId) {
          try {
            await deleteFileById(foto.fileId)
          } catch (error) {
            console.error(`Erro ao excluir arquivo ${foto.fileId}:`, error)
            // Continue mesmo se a exclusão do arquivo falhar
          }
        }
      }
    }

    // Excluir a atividade
    const result = await deleteOne("atividades", { _id: toObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Atividade excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir atividade:", error)
    return NextResponse.json({ error: "Erro ao excluir atividade" }, { status: 500 })
  }
}
