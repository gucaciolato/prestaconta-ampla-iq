import { type NextRequest, NextResponse } from "next/server"
import { findAll, insertOne, updateOne, deleteOne, toObjectId } from "@/lib/mongodb-service"

export async function GET(request: NextRequest) {
  try {
    // Teste de busca
    const searchParams = request.nextUrl.searchParams
    const collection = searchParams.get("collection") || "avisos"

    console.log(`[TEST-CRUD] Testando busca na coleção ${collection}`)

    const items = await findAll(collection, {})

    return NextResponse.json({
      success: true,
      message: `Busca na coleção ${collection} realizada com sucesso`,
      count: items.length,
      items: items.slice(0, 2), // Limitando para não sobrecarregar a resposta
    })
  } catch (error) {
    console.error("[TEST-CRUD] Erro no teste de busca:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        errorStack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Teste de inserção
    const data = await request.json()
    const collection = data.collection || "avisos_teste"
    const document = data.document || {
      titulo: "Teste de Inserção",
      conteudo: "Teste de operação de inserção",
      dataPublicacao: new Date().toISOString(),
    }

    console.log(`[TEST-CRUD] Testando inserção na coleção ${collection}`)

    const result = await insertOne(collection, document)

    return NextResponse.json({
      success: true,
      message: `Inserção na coleção ${collection} realizada com sucesso`,
      result: {
        insertedId: result.insertedId.toString(),
        acknowledged: result.acknowledged,
      },
    })
  } catch (error) {
    console.error("[TEST-CRUD] Erro no teste de inserção:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        errorStack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Teste de atualização
    const data = await request.json()
    const collection = data.collection || "avisos_teste"
    const id = data.id
    const update = data.update || { titulo: "Título Atualizado", atualizado: true }

    console.log(`[TEST-CRUD] Testando atualização na coleção ${collection}`)

    if (!id) {
      throw new Error("ID não fornecido")
    }

    const filter = { _id: toObjectId(id) }
    const result = await updateOne(collection, filter, update)

    return NextResponse.json({
      success: true,
      message: `Atualização na coleção ${collection} realizada com sucesso`,
      result: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        acknowledged: result.acknowledged,
      },
    })
  } catch (error) {
    console.error("[TEST-CRUD] Erro no teste de atualização:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        errorStack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Teste de exclusão
    const searchParams = request.nextUrl.searchParams
    const collection = searchParams.get("collection") || "avisos_teste"
    const id = searchParams.get("id")

    console.log(`[TEST-CRUD] Testando exclusão na coleção ${collection}`)

    if (!id) {
      throw new Error("ID não fornecido")
    }

    const filter = { _id: toObjectId(id) }
    const result = await deleteOne(collection, filter)

    return NextResponse.json({
      success: true,
      message: `Exclusão na coleção ${collection} realizada com sucesso`,
      result: {
        deletedCount: result.deletedCount,
        acknowledged: result.acknowledged,
      },
    })
  } catch (error) {
    console.error("[TEST-CRUD] Erro no teste de exclusão:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        errorStack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
