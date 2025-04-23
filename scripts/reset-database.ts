import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

// Carregar variáveis de ambiente
dotenv.config()

const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "prestaconta"

async function resetDatabase() {
  if (!uri) {
    console.error("MONGODB_URI não está definido nas variáveis de ambiente")
    process.exit(1)
  }

  console.log("Iniciando reset do banco de dados...")
  console.log(`URI: ${uri}`)
  console.log(`Database: ${dbName}`)

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Conectado ao MongoDB")

    const db = client.db(dbName)

    // Listar todas as coleções existentes
    const collections = await db.listCollections().toArray()
    console.log(
      "Coleções existentes:",
      collections.map((c) => c.name),
    )

    // Excluir todas as coleções existentes
    console.log("Excluindo todas as coleções existentes...")
    for (const collection of collections) {
      await db.collection(collection.name).drop()
      console.log(`Coleção ${collection.name} excluída`)
    }

    // Criar as coleções necessárias
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

    console.log("Criando coleções necessárias...")
    for (const collectionName of requiredCollections) {
      await db.createCollection(collectionName)
      console.log(`Coleção ${collectionName} criada`)
    }

    // Criar o usuário admin
    console.log("Criando usuário admin...")
    const adminUsername = process.env.NEXT_PUBLIC_USUARIO_LOGIN
    const adminPassword = process.env.NEXT_PUBLIC_SENHA_LOGIN

    if (!adminUsername || !adminPassword) {
      console.error("NEXT_PUBLIC_USUARIO_LOGIN ou NEXT_PUBLIC_SENHA_LOGIN não estão definidos")
      process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    await db.collection("usuarios").insertOne({
      username: adminUsername,
      password: hashedPassword,
      nome: "Administrador",
      email: "admin@prestaconta.com",
      role: "admin",
      ativo: true,
      dataCriacao: new Date(),
    })

    console.log(`Usuário admin (${adminUsername}) criado com sucesso`)

    // Verificar se o usuário admin foi criado corretamente
    const adminUser = await db.collection("usuarios").findOne({ username: adminUsername })
    if (adminUser) {
      console.log("Verificação: Usuário admin existe no banco de dados")
      console.log({
        id: adminUser._id,
        username: adminUser.username,
        role: adminUser.role,
        ativo: adminUser.ativo,
      })
    } else {
      console.error("Erro: Usuário admin não foi criado corretamente")
    }

    console.log("Reset do banco de dados concluído com sucesso!")
  } catch (error) {
    console.error("Erro ao resetar banco de dados:", error)
  } finally {
    await client.close()
    console.log("Conexão com o MongoDB fechada")
  }
}

// Executar a função
resetDatabase()
