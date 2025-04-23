import { type NextRequest, NextResponse } from "next/server"
import { findAll, insertOne } from "@/lib/mongodb-service"
import { getUserFromRequest } from "@/lib/auth-service"
import { hasPermission } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e permissão
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!hasPermission(user.role, "financeiro")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get("tipo") || "all" // receitas, despesas, or all
    const ano = searchParams.get("ano")
    const mes = searchParams.get("mes")

    const query: any = {}

    if (tipo !== "all") {
      query.tipo = tipo
    }

    if (ano) {
      query.ano = ano
    }

    if (mes) {
      query.mes = mes
    }

    const items = await findAll("financeiro", query, { data: -1 })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching financial data:", error)
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
    if (data.data) {
      const date = new Date(data.data)
      data.ano = date.getFullYear().toString()
      data.mes = (date.getMonth() + 1).toString()
    }

    const result = await insertOne("financeiro", data)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating financial record:", error)
    return NextResponse.json({ error: "Failed to create financial record" }, { status: 500 })
  }
}
