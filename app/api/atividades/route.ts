import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-provider"

const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "ampla"

export async function GET(request: NextRequest) {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection("atividades")

    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 0

    const query = {}

    // Opções para ordenar por data de atividade (mais recente primeiro)
    const options = {
      sort: { dataAtividade: -1 },
      limit: limit || 0,
    }

    const atividades = await collection.find(query, options).toArray()

    // Processar URLs de imagens
    const atividadesProcessadas = atividades.map((atividade) => {
      // Converter ObjectId para string
      atividade._id = atividade._id.toString()

      // Processar fotos para incluir URLs completas
      if (atividade.fotos && Array.isArray(atividade.fotos)) {
        atividade.fotos = atividade.fotos.map((foto: any) => {
          if (foto.fileId) {
            foto.url = `/api/files/${foto.fileId}`
          }
          return foto
        })
      }

      return atividade
    })

    await client.close()
    return NextResponse.json(atividadesProcessadas)
  } catch (error) {
    console.error("Erro ao buscar atividades:", error)
    return NextResponse.json({ error: "Erro ao buscar atividades" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection("atividades")

    const data = await request.json()

    // Validar dados
    if (!data.titulo || !data.descricao || !data.dataAtividade) {
      return NextResponse.json(
        { error: "Dados incompletos. Título, descrição e data da atividade são obrigatórios." },
        { status: 400 },
      )
    }

    // Preparar documento para inserção
    const atividade = {
      titulo: data.titulo,
      descricao: data.descricao,
      dataAtividade: new Date(data.dataAtividade),
      local: data.local || "",
      fotos: data.fotos || [],
      dataCadastro: new Date(),
    }

    const result = await collection.insertOne(atividade)
    await client.close()

    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...atividade,
      dataAtividade: atividade.dataAtividade.toISOString(),
      dataCadastro: atividade.dataCadastro.toISOString(),
    })
  } catch (error) {
    console.error("Erro ao criar atividade:", error)
    return NextResponse.json({ error: "Erro ao criar atividade" }, { status: 500 })
  }
}
