import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "prestaconta"

export async function GET(request: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    console.log(`[DIAGNOSTICO] Iniciando diagnóstico para arquivo: ${params.fileId}`)

    const fileId = params.fileId
    if (!fileId) {
      return NextResponse.json({ error: "ID do arquivo não fornecido" }, { status: 400 })
    }

    // Validar se o ID é um ObjectId válido do MongoDB
    if (!/^[0-9a-fA-F]{24}$/.test(fileId)) {
      return NextResponse.json(
        {
          error: "ID do arquivo inválido",
          details: "O ID deve ser um ObjectId válido do MongoDB (24 caracteres hexadecimais)",
          providedId: fileId,
        },
        { status: 400 },
      )
    }

    // Conectar ao MongoDB diretamente para diagnóstico
    const client = new MongoClient(uri)
    await client.connect()

    const db = client.db(dbName)

    // Verificar se as coleções GridFS existem
    const collections = await db.listCollections({ name: { $in: ["fs.files", "fs.chunks"] } }).toArray()
    const collectionNames = collections.map((c) => c.name)

    // Verificar se o arquivo existe
    const fileMetadata = await db.collection("fs.files").findOne({ _id: new ObjectId(fileId) })

    // Verificar chunks do arquivo
    let chunksInfo = null
    if (fileMetadata) {
      const chunksCount = await db.collection("fs.chunks").countDocuments({ files_id: new ObjectId(fileId) })
      const firstChunk = await db.collection("fs.chunks").findOne({ files_id: new ObjectId(fileId) })

      chunksInfo = {
        count: chunksCount,
        hasFirstChunk: !!firstChunk,
        firstChunkSize: firstChunk ? firstChunk.data.length() : 0,
      }
    }

    // Fechar a conexão
    await client.close()

    return NextResponse.json({
      success: true,
      fileId,
      diagnostico: {
        conexao: {
          uri: uri ? "Configurada" : "Não configurada",
          dbName,
        },
        colecoes: {
          existem: collectionNames,
          fsFiles: collectionNames.includes("fs.files"),
          fsChunks: collectionNames.includes("fs.chunks"),
        },
        arquivo: {
          existe: !!fileMetadata,
          metadata: fileMetadata
            ? {
                filename: fileMetadata.filename,
                contentType: fileMetadata.metadata?.contentType,
                length: fileMetadata.length,
                uploadDate: fileMetadata.uploadDate,
                md5: fileMetadata.md5,
              }
            : null,
        },
        chunks: chunksInfo,
      },
    })
  } catch (error) {
    console.error(`[DIAGNOSTICO] Erro:`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao realizar diagnóstico",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
