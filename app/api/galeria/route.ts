import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/postgres-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ano = searchParams.get("ano")
    const mes = searchParams.get("mes")

    let queryText = "SELECT * FROM galeria"
    const queryParams = []
    let paramIndex = 1
    let hasWhere = false

    if (ano) {
      queryText += " WHERE ano = $" + paramIndex
      queryParams.push(ano)
      paramIndex++
      hasWhere = true
    }

    if (mes) {
      queryText += hasWhere ? " AND mes = $" + paramIndex : " WHERE mes = $" + paramIndex
      queryParams.push(mes)
      paramIndex++
    }

    queryText += " ORDER BY data DESC"

    const result = await query(queryText, queryParams)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching photos:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Extract year and month from the date
    let ano = data.ano
    let mes = data.mes

    if (data.data && (!ano || !mes)) {
      const date = new Date(data.data)
      ano = date.getFullYear().toString()
      mes = (date.getMonth() + 1).toString()
    }

    const result = await query(
      `INSERT INTO galeria (titulo, descricao, data, url, ano, mes, file_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [data.titulo, data.descricao || null, data.data, data.url, ano, mes, data.fileId || null],
    )

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
    })
  } catch (error) {
    console.error("Error creating photo record:", error)
    return NextResponse.json({ error: "Failed to create photo record" }, { status: 500 })
  }
}
