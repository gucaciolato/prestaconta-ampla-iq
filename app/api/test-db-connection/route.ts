import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export async function GET() {
  const uri = process.env.MONGODB_URI || ""
  const dbName = process.env.MONGODB_DB || "prestaconta"

  if (!uri) {
    return NextResponse.json({ success: false, message: "MONGODB_URI não está definido" }, { status: 500 })
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Conexão com o MongoDB estabelecida com sucesso")

    const db = client.db(dbName)

    // Verificar coleções
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Verificar usuários
    let userCount = 0
    let adminExists = false

    if (collectionNames.includes("usuarios")) {
      const usersCollection = db.collection("usuarios")
      userCount = await usersCollection.countDocuments()

      const adminUsername = process.env.NEXT_PUBLIC_USUARIO_LOGIN
      if (adminUsername) {
        const adminUser = await usersCollection.findOne({ username: adminUsername })
        adminExists = !!adminUser
      }
    }

    return NextResponse.json({
      success: true,
      message: "Conexão com o MongoDB estabelecida com sucesso",
      database: dbName,
      collections: collectionNames,
      stats: {
        userCount,
        adminExists,
      },
    })
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao conectar ao MongoDB",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  } finally {
    await client.close()
  }
}
