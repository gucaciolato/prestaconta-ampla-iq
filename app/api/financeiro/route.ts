import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/postgres-service"
import { getUserFromRequest } from "@/lib/auth-service"
import { hasPermission } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    console.log("[FINANCEIRO] Iniciando busca de dados financeiros")
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get("tipo") || "all" // receitas, despesas, or all
    const ano = searchParams.get("ano")
    const mes = searchParams.get("mes")

    let queryText = "SELECT * FROM financeiro"
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
      hasWhere = true
    }

    if (mes) {
      queryText += hasWhere ? " AND mes = $" + paramIndex : " WHERE mes = $" + paramIndex
      queryParams.push(mes)
      paramIndex++
    }

    queryText += " ORDER BY data DESC"

    console.log("[FINANCEIRO] Executando consulta:", queryText, queryParams)
    const result = await query(queryText, queryParams)
    console.log(`[FINANCEIRO] Encontrados ${result.rowCount} registros`)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("[FINANCEIRO] Erro ao buscar dados financeiros:", error)
    return NextResponse.json({ error: "Failed to fetch financial data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e permissão
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!hasPermission(user.role, "financeiro")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

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
      `INSERT INTO financeiro (
        tipo, descricao, valor, data, categoria, 
        fonte, observacoes, ano, mes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        data.tipo,
        data.descricao,
        data.valor,
        data.data,
        data.categoria || null,
        data.fonte || null,
        data.observacoes || null,
        ano,
        mes,
      ],
    )

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
    })
  } catch (error) {
    console.error("[FINANCEIRO] Erro ao criar registro financeiro:", error)
    return NextResponse.json({ error: "Failed to create financial record" }, { status: 500 })
  }
}
