import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "ampla"

async function checkCollections() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)

    const collections = await db.listCollections().toArray()
    console.log(
      "Collections in database:",
      collections.map((c) => c.name),
    )

    // Verificar se as coleções necessárias existem
    const requiredCollections = [
      "avisos",
      "atividades",
      "financeiro",
      "galeria",
      "documentos",
      "diretoria",
      "fs.files",
      "fs.chunks",
    ]

    for (const collectionName of requiredCollections) {
      const exists = collections.some((c) => c.name === collectionName)
      console.log(`Collection ${collectionName}: ${exists ? "Exists" : "Does not exist"}`)

      if (!exists) {
        console.log(`Creating collection ${collectionName}...`)
        await db.createCollection(collectionName)
        console.log(`Collection ${collectionName} created.`)
      }
    }
  } catch (error) {
    console.error("Error checking collections:", error)
  } finally {
    await client.close()
  }
}

checkCollections()
