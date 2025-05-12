import { MongoClient, type Db, type Collection, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "ampla"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (!uri) {
    throw new Error("MONGODB_URI não está definido nas variáveis de ambiente")
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 20,
    minPoolSize: 5,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 30000,
  })

  try {
    await client.connect()
    console.log("Conectado ao MongoDB com sucesso!")
    const db = client.db(dbName)

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (e) {
    console.error("Erro ao conectar ao MongoDB:", e)
    throw new Error("Erro ao conectar ao MongoDB")
  }
}

// Função para obter a instância do banco de dados
export async function getDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  const { db } = await connectToDatabase()
  return db
}

// Alias para getDatabase para compatibilidade
export async function getDb(): Promise<Db> {
  return getDatabase()
}

// Função para converter string para ObjectId
export function toObjectId(id: string) {
  try {
    return new ObjectId(id)
  } catch (error) {
    console.error(`Erro ao converter ID para ObjectId: ${id}`, error)
    throw new Error(`ID inválido: ${id}`)
  }
}

// Função para obter uma coleção
export async function getCollection(collectionName: string): Promise<Collection> {
  try {
    const db = await getDatabase()
    return db.collection(collectionName)
  } catch (error) {
    console.error(`Erro ao obter a coleção ${collectionName}:`, error)
    throw error
  }
}

// Função para buscar todos os documentos de uma coleção
export async function findAll(collectionName: string, query = {}, sort = {}) {
  try {
    console.log(`[MONGODB] Buscando documentos na coleção ${collectionName}`, { query, sort })
    const collection = await getCollection(collectionName)
    const result = await collection.find(query).sort(sort).toArray()
    console.log(`[MONGODB] Encontrados ${result.length} documentos na coleção ${collectionName}`)
    return result
  } catch (error) {
    console.error(`[MONGODB] Erro ao buscar documentos na coleção ${collectionName}:`, error)
    throw error
  }
}

// Função para buscar um documento específico
export async function findOne(collectionName: string, query = {}) {
  try {
    console.log(`[MONGODB] Buscando um documento na coleção ${collectionName}`, { query })
    const collection = await getCollection(collectionName)
    const result = await collection.findOne(query)
    console.log(`[MONGODB] Documento encontrado na coleção ${collectionName}:`, result ? "sim" : "não")
    return result
  } catch (error) {
    console.error(`[MONGODB] Erro ao buscar documento na coleção ${collectionName}:`, error)
    throw error
  }
}

// Função para inserir um documento
export async function insertOne(collectionName: string, document: any) {
  try {
    console.log(`[MONGODB] Inserindo documento na coleção ${collectionName}`, document)
    const collection = await getCollection(collectionName)
    const result = await collection.insertOne(document)
    console.log(`[MONGODB] Documento inserido na coleção ${collectionName} com ID:`, result.insertedId)
    return result
  } catch (error) {
    console.error(`[MONGODB] Erro ao inserir documento na coleção ${collectionName}:`, error)
    throw error
  }
}

// Função para atualizar um documento
export async function updateOne(collectionName: string, filter: any, update: any) {
  try {
    console.log(`[MONGODB] Atualizando documento na coleção ${collectionName}`, { filter, update })
    const collection = await getCollection(collectionName)

    // Preparar o objeto de atualização
    const updateObj = { $set: update }

    const result = await collection.updateOne(filter, updateObj)
    console.log(`[MONGODB] Documento atualizado na coleção ${collectionName}:`, {
      matched: result.matchedCount,
      modified: result.modifiedCount,
    })
    return result
  } catch (error) {
    console.error(`[MONGODB] Erro ao atualizar documento na coleção ${collectionName}:`, error)
    throw error
  }
}

// Função para excluir um documento
export async function deleteOne(collectionName: string, filter: any) {
  try {
    console.log(`[MONGODB] Excluindo documento da coleção ${collectionName}`, { filter })
    const collection = await getCollection(collectionName)
    const result = await collection.deleteOne(filter)
    console.log(`[MONGODB] Documento excluído da coleção ${collectionName}:`, {
      deleted: result.deletedCount,
    })
    return result
  } catch (error) {
    console.error(`[MONGODB] Erro ao excluir documento da coleção ${collectionName}:`, error)
    throw error
  }
}

// Função para inicializar o banco de dados
export async function initializeDatabase() {
  try {
    console.log("[MONGODB] Inicializando banco de dados...")
    const db = await getDatabase()

    // Verificar se as coleções necessárias existem
    const requiredCollections = [
      "usuarios",
      "avisos",
      "atividades",
      "financeiro",
      "galeria",
      "documentos",
      "diretoria",
      "fs.files",
      "fs.chunks",
    ]

    const collections = await db.listCollections().toArray()
    const existingCollections = collections.map((c) => c.name)

    for (const collectionName of requiredCollections) {
      if (!existingCollections.includes(collectionName)) {
        console.log(`[MONGODB] Criando coleção ${collectionName}...`)
        await db.createCollection(collectionName)
        console.log(`[MONGODB] Coleção ${collectionName} criada.`)
      } else {
        console.log(`[MONGODB] Coleção ${collectionName} já existe.`)
      }
    }

    console.log("[MONGODB] Banco de dados inicializado com sucesso!")
    return true
  } catch (error) {
    console.error("[MONGODB] Erro ao inicializar banco de dados:", error)
    throw error
  }
}

export async function checkDatabaseHealth() {
  try {
    const db = await getDatabase()
    await db.command({ ping: 1 })
    return { status: "ok", message: "Conexão com o banco de dados está ativa" }
  } catch (error) {
    console.error("[MONGODB] Erro ao verificar saúde do banco de dados:", error)
    return {
      status: "error",
      message: "Erro na conexão com o banco de dados",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
