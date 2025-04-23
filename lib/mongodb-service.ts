import { MongoClient, type Db, type Collection, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "ampla"

let client: MongoClient | null = null
let db: Db | null = null

export function toObjectId(id: string) {
  try {
    return new ObjectId(id)
  } catch (error) {
    console.error(`Erro ao converter ID para ObjectId: ${id}`, error)
    throw new Error(`ID inválido: ${id}`)
  }
}

// Função para conectar ao MongoDB
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    if (client && db) {
      return { client, db }
    }

    if (!uri) {
      throw new Error("MONGODB_URI não está definido")
    }

    console.log("Conectando ao MongoDB...")

    client = new MongoClient(uri)
    await client.connect()

    db = client.db(dbName)
    console.log(`Conectado ao banco de dados: ${dbName}`)

    return { client, db }
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error)
    throw error
  }
}

// Função para obter uma coleção
export async function getCollection(collectionName: string): Promise<Collection> {
  try {
    const { db } = await connectToDatabase()
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

// Função para fechar a conexão
export async function closeConnection() {
  try {
    if (client) {
      await client.close()
      client = null
      db = null
      console.log("Conexão com o MongoDB fechada")
    }
  } catch (error) {
    console.error("Erro ao fechar conexão com o MongoDB:", error)
    throw error
  }
}

export async function initializeDatabase() {
  try {
    console.log("Inicializando banco de dados...")

    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(dbName)

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
        console.log(`Criando coleção ${collectionName}...`)
        await db.createCollection(collectionName)
        console.log(`Coleção ${collectionName} criada.`)
      } else {
        console.log(`Coleção ${collectionName} já existe.`)
      }
    }

    console.log("Banco de dados inicializado com sucesso!")
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error)
    throw error
  }
}
