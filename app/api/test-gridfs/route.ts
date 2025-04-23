import { NextResponse } from "next/server"
import { checkGridFSConnection, uploadFile } from "@/lib/gridfs-service"

export async function GET() {
  try {
    console.log("[TEST-GRIDFS] Verificando conexão GridFS")
    const result = await checkGridFSConnection()

    return NextResponse.json(result)
  } catch (error) {
    console.error("[TEST-GRIDFS] Erro ao verificar conexão:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    console.log("[TEST-GRIDFS] Testando upload de arquivo")

    // Criar um arquivo de teste simples
    const testContent = "Este é um arquivo de teste para o GridFS " + new Date().toISOString()
    const testBuffer = Buffer.from(testContent)

    // Fazer upload do arquivo de teste
    const fileId = await uploadFile(testBuffer, "teste.txt", "text/plain")

    return NextResponse.json({
      success: true,
      fileId,
      message: "Arquivo de teste enviado com sucesso",
      fileUrl: `/api/files/${fileId}`,
    })
  } catch (error) {
    console.error("[TEST-GRIDFS] Erro ao testar upload:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
