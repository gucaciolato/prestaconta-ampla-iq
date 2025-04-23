import { type NextRequest, NextResponse } from "next/server"
import { getFileById } from "@/lib/gridfs-service"

export async function GET(request: NextRequest) {
  try {
    // Obter o ID do arquivo da query string
    const fileId = request.nextUrl.searchParams.get("fileId")

    if (!fileId) {
      return NextResponse.json({ error: "ID do arquivo não fornecido" }, { status: 400 })
    }

    console.log(`[TEST-FILE] Testando acesso ao arquivo: ${fileId}`)

    // Verificar se o ID é um ObjectId válido do MongoDB
    if (!/^[0-9a-fA-F]{24}$/.test(fileId)) {
      return NextResponse.json(
        {
          error: "ID do arquivo inválido",
          details: "O ID deve ser um ObjectId válido do MongoDB (24 caracteres hexadecimais)",
        },
        { status: 400 },
      )
    }

    // Tentar buscar o arquivo
    const result = await getFileById(fileId)

    if (!result) {
      return NextResponse.json(
        {
          error: "Arquivo não encontrado",
          details: "Não foi possível encontrar um arquivo com o ID fornecido",
        },
        { status: 404 },
      )
    }

    // Retornar informações sobre o arquivo
    return NextResponse.json({
      success: true,
      fileId: fileId,
      fileName: result.metadata.filename,
      contentType: result.metadata.metadata?.contentType || "application/octet-stream",
      fileSize: result.file.length,
      url: `/api/files/${fileId}`,
    })
  } catch (error) {
    console.error("[TEST-FILE] Erro ao testar acesso ao arquivo:", error)
    return NextResponse.json(
      {
        error: "Falha ao testar acesso ao arquivo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
