import { type NextRequest, NextResponse } from "next/server"
import { deleteOne, toObjectId } from "@/lib/mongodb-service"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Excluir o registro financeiro
    const result = await deleteOne("financeiro", { _id: toObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Registro financeiro não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Registro financeiro excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir registro financeiro:", error)
    return NextResponse.json({ error: "Erro ao excluir registro financeiro" }, { status: 500 })
  }
}
