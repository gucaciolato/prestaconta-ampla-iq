import { type NextRequest, NextResponse } from "next/server"
import { getFileById } from "@/lib/gridfs-service"

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    // Await the params object first
    const { fileId } = await params
    
    console.log(`[FILES] Solicitação de arquivo: ${fileId}`)

    if (!fileId) {
      console.error("[FILES] ID do arquivo não fornecido")
      return NextResponse.json({ error: "ID do arquivo não fornecido" }, { status: 400 })
    }

    // Validar se o ID é um ObjectId válido do MongoDB
    if (!/^[0-9a-fA-F]{24}$/.test(fileId)) {
      console.error(`[FILES] ID do arquivo inválido: ${fileId}`)
      return NextResponse.json({ error: "ID do arquivo inválido" }, { status: 400 })
    }

    const result = await getFileById(fileId)

    if (!result) {
      console.error(`[FILES] Arquivo não encontrado: ${fileId}`)
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 })
    }

    const { file, metadata } = result

    console.log(`[FILES] Arquivo encontrado: ${fileId}, tamanho: ${file.length} bytes`)
    console.log(`[FILES] Metadata:`, metadata)

    // Determinar o tipo de conteúdo
    const contentType = metadata.metadata?.contentType || "application/octet-stream"
    console.log(`[FILES] Tipo de conteúdo: ${contentType}`)

    // Retornar o arquivo com o tipo de conteúdo apropriado
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${metadata.filename}"`,
        "Cache-Control": "public, max-age=31536000",
      },
    })
  } catch (error) {
    console.error(`[FILES] Erro ao buscar arquivo:`, error)
    return NextResponse.json(
      {
        error: "Falha ao buscar arquivo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
