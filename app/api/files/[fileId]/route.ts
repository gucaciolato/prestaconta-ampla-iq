import { type NextRequest, NextResponse } from "next/server"
import { getFileById } from "@/lib/gridfs-service"

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    console.log(`[FILES] Solicitação de arquivo: ${params.fileId}`)

    const fileId = params.fileId
    if (!fileId) {
      console.error("[FILES] ID do arquivo não fornecido")
      return NextResponse.json({ error: "ID do arquivo não fornecido" }, { status: 400 })
    }

    // Validar se o ID é um ObjectId válido do MongoDB
    if (!/^[0-9a-fA-F]{24}$/.test(fileId)) {
      console.error(`[FILES] ID do arquivo inválido: ${fileId}`)
      return NextResponse.json({ error: "ID do arquivo inválido" }, { status: 400 })
    }

    console.log(`[FILES] Buscando arquivo com ID: ${fileId}`)
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

    // Verificar se o buffer do arquivo é válido
    if (!file || file.length === 0) {
      console.error(`[FILES] Arquivo vazio ou inválido: ${fileId}`)
      return NextResponse.json({ error: "Arquivo vazio ou inválido" }, { status: 500 })
    }

    try {
      // Determinar se deve ser inline ou attachment baseado no tipo de conteúdo
      const disposition =
        contentType.startsWith("image/") || contentType === "application/pdf" ? "inline" : "attachment"

      const filename = metadata.filename || `file-${fileId}`

      console.log(`[FILES] Retornando arquivo: ${fileId}, disposition: ${disposition}, filename: ${filename}`)

      // Retornar o arquivo com o tipo de conteúdo apropriado
      return new NextResponse(file, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `${disposition}; filename="${encodeURIComponent(filename)}"`,
          "Content-Length": file.length.toString(),
          "Cache-Control": "public, max-age=31536000",
          // Adicionar headers para evitar problemas de CORS
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type, Content-Disposition",
        },
      })
    } catch (responseError) {
      console.error(`[FILES] Erro ao criar resposta:`, responseError)
      return NextResponse.json(
        {
          error: "Erro ao processar o arquivo",
          details: responseError instanceof Error ? responseError.message : String(responseError),
        },
        { status: 500 },
      )
    }
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
