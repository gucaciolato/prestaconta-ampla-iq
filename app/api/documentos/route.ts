import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/postgres-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get("tipo") || "all" // livros, relatorios, or all
    const ano = searchParams.get("ano")

    let queryText = "SELECT * FROM documentos"
    const queryParams = []
    let paramIndex = 1
    let hasWhere = false

    if (tipo !== "all") {
      queryText += " WHERE tipo = $" + paramIndex
      queryParams.push(tipo)
      paramIndex++
      hasWhere = true
    }

    if (ano) {
      queryText += hasWhere ? " AND ano = $" + paramIndex : " WHERE ano = $" + paramIndex
      queryParams.push(ano)
      paramIndex++
    }

    queryText += " ORDER BY ano DESC"

    const result = await query(queryText, queryParams)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const result = await query(
      `INSERT INTO documentos (titulo, tipo, ano, mes, url, file_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [data.titulo, data.tipo, data.ano || null, data.mes || null, data.url, data.fileId || null],
    )

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
    })
  } catch (error) {
    console.error("Error creating document record:", error)
    return NextResponse.json({ error: "Failed to create document record" }, { status: 500 })
  }
}
