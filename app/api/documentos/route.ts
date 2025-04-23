import { type NextRequest, NextResponse } from "next/server"
import { findAll, insertOne } from "@/lib/mongodb-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get("tipo") || "all" // livros, relatorios, or all
    const ano = searchParams.get("ano")

    const query: any = {}

    if (tipo !== "all") {
      query.tipo = tipo
    }

    if (ano) {
      query.ano = ano
    }

    const documentos = await findAll("documentos", query, { ano: -1 })

    return NextResponse.json(documentos)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const result = await insertOne("documentos", data)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating document record:", error)
    return NextResponse.json({ error: "Failed to create document record" }, { status: 500 })
  }
}
