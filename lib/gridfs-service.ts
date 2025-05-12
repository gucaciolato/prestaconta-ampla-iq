import { GridFSBucket, ObjectId } from "mongodb"
import { Readable } from "stream"
import { getDb } from "./mongodb-service"

// Function to get a file from GridFS by ID
export async function getFileById(fileId: string) {
  try {
    console.log(`[GridFS] Buscando arquivo com ID: ${fileId}`)

    const db = await getDb()
    const bucket = new GridFSBucket(db, { bucketName: "fs" })

    // Check if file exists
    const file = await db.collection("fs.files").findOne({ _id: new ObjectId(fileId) })

    if (!file) {
      console.log(`[GridFS] Arquivo não encontrado: ${fileId}`)
      return null
    }

    console.log(`[GridFS] Arquivo encontrado, iniciando download: ${fileId}`)

    // Create a stream to read the file
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId))

    // Convert stream to buffer
    const chunks: Buffer[] = []

    return new Promise<{ file: Buffer; metadata: any }>((resolve, reject) => {
      downloadStream.on("data", (chunk) => {
        chunks.push(Buffer.from(chunk))
      })

      downloadStream.on("error", (error) => {
        console.error(`[GridFS] Erro ao ler arquivo: ${error.message}`)
        reject(error)
      })

      downloadStream.on("end", () => {
        console.log(`[GridFS] Download completo para arquivo: ${fileId}`)
        const fileBuffer = Buffer.concat(chunks)
        resolve({
          file: fileBuffer,
          metadata: file,
        })
      })

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error("Timeout while reading file"))
      }, 30000) // 30 seconds timeout

      // Limpar o timeout quando o download terminar
      downloadStream.on("end", () => {
        clearTimeout(timeout)
      })
    })
  } catch (error) {
    console.error(`[GridFS] Erro ao buscar arquivo: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

// Function to check GridFS connection
export async function checkGridFSConnection() {
  try {
    const db = await getDb()

    // Verificar se as coleções do GridFS existem
    const collections = await db.listCollections({ name: { $in: ["fs.files", "fs.chunks"] } }).toArray()

    if (collections.length < 2) {
      return {
        success: false,
        message: "Coleções do GridFS não encontradas",
        collections: collections.map((c) => c.name),
      }
    }

    // Verificar se podemos criar um bucket
    const bucket = new GridFSBucket(db, { bucketName: "fs" })

    return {
      success: true,
      message: "Conexão GridFS bem-sucedida",
      collections: collections.map((c) => c.name),
    }
  } catch (error) {
    console.error("[GridFS] Erro ao conectar ao GridFS:", error)
    return {
      success: false,
      message: "Erro ao conectar ao GridFS",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Function to upload a file to GridFS
export async function uploadFile(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  try {
    console.log(`[GridFS] Iniciando upload de arquivo: ${filename}, tipo: ${contentType}`)

    const db = await getDb()
    const bucket = new GridFSBucket(db, { bucketName: "fs" })

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: {
          contentType: contentType,
        },
      })

      const bufferStream = new Readable()
      bufferStream.push(buffer)
      bufferStream.push(null)

      bufferStream
        .pipe(uploadStream)
        .on("error", (error) => {
          console.error(`[GridFS] Erro no upload: ${error.message}`)
          reject("Erro ao fazer upload do arquivo: " + error)
        })
        .on("finish", () => {
          console.log(`[GridFS] Upload concluído com sucesso, ID: ${uploadStream.id.toString()}`)
          resolve(uploadStream.id.toString())
        })
    })
  } catch (error) {
    console.error("[GridFS] Erro ao fazer upload do arquivo:", error)
    throw new Error("Erro ao fazer upload do arquivo: " + error)
  }
}

// Function to list files in GridFS
export async function listFiles() {
  try {
    console.log("[GridFS] Listando arquivos")

    const db = await getDb()
    const bucket = new GridFSBucket(db, { bucketName: "fs" })

    const files = await bucket.find({}).toArray()
    console.log(`[GridFS] ${files.length} arquivos encontrados`)
    return files
  } catch (error) {
    console.error("[GridFS] Erro ao listar arquivos:", error)
    throw new Error("Erro ao listar arquivos: " + error)
  }
}

// Function to delete a file from GridFS by ID
export async function deleteFileById(fileId: string): Promise<boolean> {
  try {
    console.log(`[GridFS] Excluindo arquivo: ${fileId}`)

    const db = await getDb()
    const bucket = new GridFSBucket(db, { bucketName: "fs" })

    await bucket.delete(new ObjectId(fileId))
    console.log(`[GridFS] Arquivo excluído com sucesso: ${fileId}`)
    return true
  } catch (error) {
    console.error(`[GridFS] Erro ao excluir arquivo: ${error}`)
    return false
  }
}
