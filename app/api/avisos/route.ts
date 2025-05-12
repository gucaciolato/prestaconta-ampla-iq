import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/postgres-service"

export async function GET(request: NextRequest) {
  try {
    console.log("[AVISOS] Iniciando busca de avisos")
    const searchParams = request.nextUrl.searchParams
    const destaque = searchParams.get("destaque")

    let queryText = "SELECT * FROM avisos"
    const queryParams = []

    if (destaque === "true") {
      queryText += " WHERE destaque = true"
    }

    queryText += " ORDER BY data_publicacao DESC"

    console.log("[AVISOS] Executando consulta:", queryText)
    const result = await query(queryText, queryParams)
    console.log(`[AVISOS] Encontrados ${result.rowCount} avisos`)

    // Processar URLs de arquivos se existirem
    const processedAvisos = result.rows.map((aviso) => {
      if (aviso.arquivo_id) {
        return {
          ...aviso,
          arquivoUrl: `/api/files/${aviso.arquivo_id}`,
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

    const {
      titulo,
      conteudo,
      periodoInscricao,
      documentos,
      dataPublicacao,
      destaque,
      imagem,
      arquivoId,
      arquivoNome,
      arquivoTipo,
      fileId,
    } = data

    console.log("[AVISOS] Salvando aviso no banco de dados")
    const result = await query(
      `INSERT INTO avisos (
        titulo, conteudo, periodo_inscricao, documentos, 
        data_publicacao, destaque, imagem, arquivo_id, 
        arquivo_nome, arquivo_tipo, file_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        titulo,
        conteudo,
        periodoInscricao || null,
        documentos || null,
        dataPublicacao,
        destaque || false,
        imagem || null,
        arquivoId || null,
        arquivoNome || null,
        arquivoTipo || null,
        fileId || null,
      ],
    )

    console.log("[AVISOS] Aviso salvo com sucesso:", result.rows[0].id)

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
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
