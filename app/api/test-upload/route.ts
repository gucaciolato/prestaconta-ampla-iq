import { type NextRequest, NextResponse } from "next/server"
import { uploadFile, listFiles } from "@/lib/gridfs-service"

export async function GET(request: NextRequest) {
  try {
    console.log("[TEST-UPLOAD] Listando todos os arquivos no GridFS")
    const files = await listFiles()

    return NextResponse.json({
      success: true,
      message: "Arquivos listados com sucesso",
      count: files.length,
      files: files.map((file) => ({
        id: file._id.toString(),
        filename: file.filename,
        length: file.length,
        uploadDate: file.uploadDate,
        contentType: file.metadata?.contentType || "unknown",
      })),
    })
  } catch (error) {
    console.error("[TEST-UPLOAD] Erro ao listar arquivos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao listar arquivos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[TEST-UPLOAD] Iniciando teste de upload")

    // Criar um buffer de teste
    const testBuffer = Buffer.from("Este é um arquivo de teste para verificar o funcionamento do GridFS")
    const filename = `test-file-${Date.now()}.txt`
    const contentType = "text/plain"

    console.log(`[TEST-UPLOAD] Enviando arquivo de teste: ${filename}`)
    const fileId = await uploadFile(testBuffer, filename, contentType)

    return NextResponse.json({
      success: true,
      message: "Arquivo de teste enviado com sucesso",
      fileId,
      fileUrl: `/api/files/${fileId}`,
    })
  } catch (error) {
    console.error("[TEST-UPLOAD] Erro no teste de upload:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Falha no teste de upload",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
