import { type NextRequest, NextResponse } from "next/server"
import { findAll, insertOne } from "@/lib/mongodb-service"

export async function GET(request: NextRequest) {
  try {
    console.log("[AVISOS] Iniciando busca de avisos")
    const searchParams = request.nextUrl.searchParams
    const destaque = searchParams.get("destaque")

    let query = {}
    if (destaque === "true") {
      query = { destaque: true }
    }

    console.log("[AVISOS] Buscando avisos com query:", query)
    const avisos = await findAll("avisos", query, { dataPublicacao: -1 })
    console.log(`[AVISOS] Encontrados ${avisos.length} avisos`)

    // Processar URLs de arquivos se existirem
    const processedAvisos = avisos.map((aviso: any) => {
      if (aviso.arquivoId) {
        return {
          ...aviso,
          arquivoUrl: `/api/files/${aviso.arquivoId}`,
        }
      }
      return aviso
    })

    return NextResponse.json(processedAvisos)
  } catch (error) {
    console.error("[AVISOS] Erro ao buscar avisos:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch avisos",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[AVISOS] Iniciando criação de novo aviso")
    const data = await request.json()
    console.log("[AVISOS] Dados recebidos:", data)

    // Add current date if not provided
    if (!data.dataPublicacao) {
      data.dataPublicacao = new Date().toISOString()
    }

    console.log("[AVISOS] Salvando aviso no banco de dados")
    const result = await insertOne("avisos", data)
    console.log("[AVISOS] Aviso salvo com sucesso:", result.insertedId)

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("[AVISOS] Erro ao criar aviso:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create aviso",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
