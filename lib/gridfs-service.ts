import { MongoClient, GridFSBucket, ObjectId } from "mongodb"
import { Readable } from "stream"

const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "prestaconta"

// Cache de conexão para reutilização
let cachedClient: MongoClient | null = null

// Função para obter uma conexão MongoDB
async function getMongoClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI não está definido nas variáveis de ambiente")
  }

  try {
    // Reutilizar cliente existente se disponível
    if (cachedClient) {
      // Verificar se o cliente ainda está conectado
      await cachedClient.db("admin").command({ ping: 1 })
      console.log("[GridFS] Usando conexão MongoDB existente")
      return cachedClient
    }

    // Criar nova conexão
    console.log("[GridFS] Criando nova conexão MongoDB")
    const client = new MongoClient(uri)
    await client.connect()

    // Verificar conexão com ping
    await client.db("admin").command({ ping: 1 })
    console.log("[GridFS] Conexão MongoDB estabelecida com sucesso")

    // Armazenar cliente em cache
    cachedClient = client
    return client
  } catch (error) {
    console.error("[GridFS] Erro ao conectar ao MongoDB:", error)
    // Limpar cache em caso de erro
    cachedClient = null
    throw new Error(`Falha ao conectar ao MongoDB: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Função para obter um arquivo do GridFS pelo ID
export async function getFileById(fileId: string) {
  console.log(`[GridFS] Buscando arquivo com ID: ${fileId}`)
  let client: MongoClient | null = null

  try {
    client = await getMongoClient()
    const db = client.db(dbName)
    console.log(`[GridFS] Usando banco de dados: ${dbName}`)

    const bucket = new GridFSBucket(db)

    // Verificar se o arquivo existe
    console.log(`[GridFS] Verificando se o arquivo existe: ${fileId}`)
    const file = await db.collection("fs.files").findOne({ _id: new ObjectId(fileId) })

    if (!file) {
      console.log(`[GridFS] Arquivo não encontrado: ${fileId}`)
      return null
    }

    console.log(`[GridFS] Arquivo encontrado: ${file.filename}, tamanho: ${file.length} bytes`)

    // Criar um stream para ler o arquivo
    console.log(`[GridFS] Abrindo stream para download do arquivo`)
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId))

    // Converter o stream para buffer
    const chunks: Buffer[] = []

    return new Promise<{ file: Buffer; metadata: any }>((resolve, reject) => {
      downloadStream.on("data", (chunk) => {
        console.log(`[GridFS] Recebido chunk de ${chunk.length} bytes`)
        chunks.push(Buffer.from(chunk))
      })

      downloadStream.on("error", (error) => {
        console.error(`[GridFS] Erro ao ler arquivo: ${error.message}`)
        reject(error)
      })

      downloadStream.on("end", () => {
        const fileBuffer = Buffer.concat(chunks)
        console.log(`[GridFS] Download concluído. Tamanho total: ${fileBuffer.length} bytes`)
        resolve({
          file: fileBuffer,
          metadata: file,
        })
      })
    })
  } catch (error) {
    console.error(`[GridFS] Erro ao buscar arquivo: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
  // Não fechamos a conexão aqui para reutilização
}

// Função para salvar um arquivo no GridFS
export async function uploadFile(fileBuffer: Buffer, filename: string, contentType: string) {
  console.log(
    `[GridFS] Iniciando upload de arquivo: ${filename}, tipo: ${contentType}, tamanho: ${fileBuffer.length} bytes`,
  )
  let client: MongoClient | null = null

  try {
    // Obter cliente MongoDB conectado
    client = await getMongoClient()
    const db = client.db(dbName)
    console.log(`[GridFS] Usando banco de dados: ${dbName}`)

    // Verificar se as coleções GridFS existem
    const collections = await db.listCollections({ name: { $in: ["fs.files", "fs.chunks"] } }).toArray()
    const collectionNames = collections.map((c) => c.name)
    console.log(`[GridFS] Coleções GridFS encontradas: ${collectionNames.join(", ") || "nenhuma"}`)

    // Criar coleções se não existirem
    if (!collectionNames.includes("fs.files")) {
      console.log("[GridFS] Criando coleção fs.files")
      await db.createCollection("fs.files")
    }

    if (!collectionNames.includes("fs.chunks")) {
      console.log("[GridFS] Criando coleção fs.chunks")
      await db.createCollection("fs.chunks")
    }

    const bucket = new GridFSBucket(db)

    // Criar um stream para escrever o arquivo
    console.log(`[GridFS] Abrindo stream para upload do arquivo`)
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        contentType: contentType,
      },
    })

    // Criar um stream legível a partir do buffer
    const readableStream = new Readable()
    readableStream.push(fileBuffer)
    readableStream.push(null) // Sinaliza o fim do stream

    // Pipe do stream legível para o stream de upload
    return new Promise<string>((resolve, reject) => {
      readableStream
        .pipe(uploadStream)
        .on("error", (error) => {
          console.error(`[GridFS] Erro durante o upload: ${error.message}`)
          reject(error)
        })
        .on("finish", () => {
          const fileId = uploadStream.id.toString()
          console.log(`[GridFS] Upload concluído com sucesso. FileID: ${fileId}`)
          resolve(fileId)
        })
    })
  } catch (error) {
    console.error(`[GridFS] Erro ao fazer upload do arquivo: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
  // Não fechamos a conexão aqui para reutilização
}

// Função para excluir um arquivo do GridFS
export async function deleteFileById(fileId: string) {
  console.log(`[GridFS] Iniciando exclusão de arquivo: ${fileId}`)
  let client: MongoClient | null = null

  try {
    client = await getMongoClient()
    const db = client.db(dbName)
    console.log(`[GridFS] Usando banco de dados: ${dbName}`)

    const bucket = new GridFSBucket(db)

    // Verificar se o arquivo existe antes de excluir
    const file = await db.collection("fs.files").findOne({ _id: new ObjectId(fileId) })
    if (!file) {
      console.log(`[GridFS] Arquivo não encontrado para exclusão: ${fileId}`)
      return false
    }

    console.log(`[GridFS] Excluindo arquivo: ${fileId}`)
    await bucket.delete(new ObjectId(fileId))
    console.log(`[GridFS] Arquivo excluído com sucesso: ${fileId}`)
    return true
  } catch (error) {
    console.error(`[GridFS] Erro ao excluir arquivo: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
  // Não fechamos a conexão aqui para reutilização
}

// Função para listar todos os arquivos do GridFS
export async function listFiles() {
  console.log(`[GridFS] Listando todos os arquivos`)
  let client: MongoClient | null = null

  try {
    client = await getMongoClient()
    const db = client.db(dbName)
    console.log(`[GridFS] Usando banco de dados: ${dbName}`)

    const files = await db.collection("fs.files").find({}).toArray()
    console.log(`[GridFS] ${files.length} arquivos encontrados`)
    return files
  } catch (error) {
    console.error(`[GridFS] Erro ao listar arquivos: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
  // Não fechamos a conexão aqui para reutilização
}

// Função para verificar a conexão com o MongoDB e as coleções GridFS
export async function checkGridFSConnection() {
  let client: MongoClient | null = null

  try {
    client = await getMongoClient()
    const db = client.db(dbName)

    // Verificar se as coleções GridFS existem
    const collections = await db.listCollections({ name: { $in: ["fs.files", "fs.chunks"] } }).toArray()
    const collectionNames = collections.map((c) => c.name)

    // Criar coleções se não existirem
    if (!collectionNames.includes("fs.files")) {
      await db.createCollection("fs.files")
    }

    if (!collectionNames.includes("fs.chunks")) {
      await db.createCollection("fs.chunks")
    }

    // Verificar se podemos escrever nas coleções
    const testId = new ObjectId()
    await db.collection("fs.files").insertOne({
      _id: testId,
      test: true,
      createdAt: new Date(),
    })

    // Limpar após o teste
    await db.collection("fs.files").deleteOne({ _id: testId })

    return {
      success: true,
      collections: collectionNames,
      database: dbName,
    }
  } catch (error) {
    console.error("[GridFS] Erro ao verificar conexão:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
  // Não fechamos a conexão aqui para reutilização
}
