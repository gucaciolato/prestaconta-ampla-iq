import { MongoClient } from "mongodb"
import dotenv from "dotenv"

// Carregar variáveis de ambiente
dotenv.config()

const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "prestaconta"

async function checkDatabaseConnection() {
  if (!uri) {
    console.error("MONGODB_URI não está definido nas variáveis de ambiente")
    process.exit(1)
  }

  console.log("Verificando conexão com o banco de dados...")
  console.log(`URI: ${uri}`)
  console.log(`Database: ${dbName}`)

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Conectado ao MongoDB com sucesso!")

    const db = client.db(dbName)

    // Verificar se o banco de dados existe
    const dbs = await client.db().admin().listDatabases()
    const dbExists = dbs.databases.some((d) => d.name === dbName)

    if (dbExists) {
      console.log(`Banco de dados '${dbName}' existe`)

      // Listar todas as coleções
      const collections = await db.listCollections().toArray()
      console.log(
        "Coleções existentes:",
        collections.map((c) => c.name),
      )

      // Verificar se a coleção de usuários existe e tem algum documento
      if (collections.some((c) => c.name === "usuarios")) {
        const usersCount = await db.collection("usuarios").countDocuments()
        console.log(`Número de usuários: ${usersCount}`)

        if (usersCount > 0) {
          const users = await db.collection("usuarios").find({}).toArray()
          console.log(
            "Usuários existentes:",
            users.map((u) => ({
              id: u._id,
              username: u.username,
              role: u.role,
              ativo: u.ativo,
            })),
          )
        }
      }
    } else {
      console.log(`Banco de dados '${dbName}' não existe`)
    }
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error)
  } finally {
    await client.close()
    console.log("Conexão com o MongoDB fechada")
  }
}

// Executar a função
checkDatabaseConnection()
