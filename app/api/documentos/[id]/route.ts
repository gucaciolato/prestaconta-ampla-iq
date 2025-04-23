import { type NextRequest, NextResponse } from "next/server"
import { findOne, deleteOne, toObjectId } from "@/lib/mongodb-service"
import { deleteFileById } from "@/lib/gridfs-service"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Buscar o documento para obter o ID do arquivo
    const documento = await findOne("documentos", { _id: toObjectId(id) })

    if (!documento) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 })
    }

    // Excluir o arquivo associado
    if (documento.fileId) {
      try {
        await deleteFileById(documento.fileId)
      } catch (error) {
        console.error(`Erro ao excluir arquivo ${documento.fileId}:`, error)
        // Continue mesmo se a exclusão do arquivo falhar
      }
    }

    // Excluir o documento
    const result = await deleteOne("documentos", { _id: toObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Documento excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir documento:", error)
    return NextResponse.json({ error: "Erro ao excluir documento" }, { status: 500 })
  }
}
