import { type NextRequest, NextResponse } from "next/server"
import { uploadFile } from "@/lib/gridfs-service"

export async function POST(request: NextRequest) {
  console.log("[UPLOAD] Iniciando processamento de upload")

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("[UPLOAD] Nenhum arquivo encontrado na requisição")
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    console.log(`[UPLOAD] Arquivo recebido: ${file.name}, tamanho: ${file.size} bytes, tipo: ${file.type}`)

    // Verificar tipo de arquivo
    if (!file.type.match(/^application\/pdf/)) {
      console.error(`[UPLOAD] Tipo de arquivo não permitido: ${file.type}`)
      return NextResponse.json({ error: "Apenas arquivos PDF são permitidos" }, { status: 400 })
    }

    // Converter o arquivo para buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log(`[UPLOAD] Buffer criado com ${buffer.length} bytes`)

    // Fazer upload para o GridFS
    const fileId = await uploadFile(buffer, file.name, file.type)
    console.log(`[UPLOAD] Upload concluído. FileID: ${fileId}`)

    // Construir a URL do arquivo
    const fileUrl = `/api/files/${fileId}`
    console.log(`[UPLOAD] URL do arquivo: ${fileUrl}`)

    return NextResponse.json({
      success: true,
      fileId,
      fileUrl,
      fileName: file.name,
      contentType: file.type,
    })
  } catch (error) {
    console.error("[UPLOAD] Erro durante o upload:", error)
    return NextResponse.json(
      {
        error: "Falha ao processar o upload",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
