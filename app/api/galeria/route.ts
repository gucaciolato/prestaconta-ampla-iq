import { type NextRequest, NextResponse } from "next/server"
import { findAll, insertOne } from "@/lib/mongodb-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ano = searchParams.get("ano")
    const mes = searchParams.get("mes")

    const query: any = {}

    if (ano) {
      query.ano = ano
    }

    if (mes) {
      query.mes = mes
    }

    const fotos = await findAll("galeria", query, { data: -1 })

    return NextResponse.json(fotos)
  } catch (error) {
    console.error("Error fetching photos:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Extract year and month from the date
    if (data.data) {
      const date = new Date(data.data)
      data.ano = date.getFullYear().toString()
      data.mes = (date.getMonth() + 1).toString()
    }

    const result = await insertOne("galeria", data)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating photo record:", error)
    return NextResponse.json({ error: "Failed to create photo record" }, { status: 500 })
  }
}
