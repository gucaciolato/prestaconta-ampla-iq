import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

// Carregar variáveis de ambiente
dotenv.config()

const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "prestaconta"
const adminUsername = process.env.NEXT_PUBLIC_USUARIO_LOGIN
const adminPassword = process.env.NEXT_PUBLIC_SENHA_LOGIN

async function fixAdminUser() {
  if (!uri || !dbName || !adminUsername || !adminPassword) {
    console.error("Variáveis de ambiente necessárias não estão definidas")
    process.exit(1)
  }

  console.log("Iniciando correção do usuário admin...")
  console.log(`URI: ${uri}`)
  console.log(`Database: ${dbName}`)
  console.log(`Admin username: ${adminUsername}`)

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Conectado ao MongoDB")

    const db = client.db(dbName)
    const usersCollection = db.collection("usuarios")

    // Verificar se o usuário admin existe
    const adminUser = await usersCollection.findOne({ username: adminUsername })

    if (adminUser) {
      console.log(`Usuário admin '${adminUsername}' encontrado. Atualizando...`)

      // Hash da senha
      const hashedPassword = await bcrypt.hash(adminPassword, 10)

      // Atualizar o usuário admin
      const result = await usersCollection.updateOne(
        { username: adminUsername },
        {
          $set: {
            password: hashedPassword,
            nome: "Administrador",
            email: "admin@prestaconta.com",
            role: "admin",
            ativo: true,
            updatedAt: new Date(),
          },
        },
      )

      console.log(`Usuário admin atualizado: ${result.modifiedCount} documento(s) modificado(s)`)
    } else {
      console.log(`Usuário admin '${adminUsername}' não encontrado. Criando...`)

      // Hash da senha
      const hashedPassword = await bcrypt.hash(adminPassword, 10)

      // Criar o usuário admin
      const result = await usersCollection.insertOne({
        username: adminUsername,
        password: hashedPassword,
        nome: "Administrador",
        email: "admin@prestaconta.com",
        role: "admin",
        ativo: true,
        dataCriacao: new Date(),
      })

      console.log(`Usuário admin criado com ID: ${result.insertedId}`)
    }

    // Verificar se o usuário admin foi criado/atualizado corretamente
    const updatedAdminUser = await usersCollection.findOne({ username: adminUsername })
    if (updatedAdminUser) {
      console.log("Verificação: Usuário admin existe no banco de dados")
      console.log({
        id: updatedAdminUser._id,
        username: updatedAdminUser.username,
        role: updatedAdminUser.role,
        ativo: updatedAdminUser.ativo,
      })
    }

    console.log("Correção do usuário admin concluída com sucesso!")
  } catch (error) {
    console.error("Erro ao corrigir usuário admin:", error)
  } finally {
    await client.close()
    console.log("Conexão com o MongoDB fechada")
  }
}

// Executar a função
fixAdminUser()
