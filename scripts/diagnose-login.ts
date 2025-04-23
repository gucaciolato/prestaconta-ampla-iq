import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

// Carregar variáveis de ambiente
dotenv.config()

const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "prestaconta"
const adminUsername = process.env.NEXT_PUBLIC_USUARIO_LOGIN
const adminPassword = process.env.NEXT_PUBLIC_SENHA_LOGIN
const jwtSecret = process.env.JWT_SECRET

async function diagnoseLogin() {
  console.log("=== DIAGNÓSTICO DO SISTEMA DE LOGIN ===")

  // Verificar variáveis de ambiente
  console.log("\n1. Verificando variáveis de ambiente:")
  console.log(`MONGODB_URI: ${uri ? "✅ Definido" : "❌ Não definido"}`)
  console.log(`MONGODB_DB: ${dbName ? "✅ Definido" : "❌ Não definido"}`)
  console.log(`NEXT_PUBLIC_USUARIO_LOGIN: ${adminUsername ? "✅ Definido" : "❌ Não definido"}`)
  console.log(`NEXT_PUBLIC_SENHA_LOGIN: ${adminPassword ? "✅ Definido" : "❌ Não definido"}`)
  console.log(`JWT_SECRET: ${jwtSecret ? "✅ Definido" : "❌ Não definido"}`)

  if (!uri || !dbName || !adminUsername || !adminPassword || !jwtSecret) {
    console.log("\n❌ ERRO: Uma ou mais variáveis de ambiente estão faltando.")
    return
  }

  // Verificar conexão com o MongoDB
  console.log("\n2. Verificando conexão com o MongoDB:")
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("✅ Conexão com o MongoDB estabelecida com sucesso.")

    // Verificar banco de dados
    const db = client.db(dbName)
    console.log(`✅ Banco de dados '${dbName}' acessado com sucesso.`)

    // Verificar coleção de usuários
    const collections = await db.listCollections().toArray()
    const hasUsersCollection = collections.some((col) => col.name === "usuarios")

    if (hasUsersCollection) {
      console.log("✅ Coleção 'usuarios' existe.")

      // Verificar usuário admin
      const usersCollection = db.collection("usuarios")
      const adminUser = await usersCollection.findOne({ username: adminUsername })

      if (adminUser) {
        console.log(`✅ Usuário admin '${adminUsername}' encontrado.`)
        console.log(`   ID: ${adminUser._id}`)
        console.log(`   Role: ${adminUser.role}`)
        console.log(`   Ativo: ${adminUser.ativo ? "Sim" : "Não"}`)

        // Verificar senha do admin
        if (adminPassword) {
          try {
            const passwordMatch = await bcrypt.compare(adminPassword, adminUser.password)
            console.log(`   Senha corresponde: ${passwordMatch ? "✅ Sim" : "❌ Não"}`)

            if (!passwordMatch) {
              console.log(
                "\n❌ PROBLEMA DETECTADO: A senha do admin não corresponde à senha nas variáveis de ambiente.",
              )
              console.log("   Solução: Atualize a senha do usuário admin no banco de dados.")
            }
          } catch (error) {
            console.log(`   ❌ Erro ao verificar senha: ${error}`)
          }
        }

        if (!adminUser.ativo) {
          console.log("\n❌ PROBLEMA DETECTADO: O usuário admin está inativo.")
          console.log("   Solução: Ative o usuário admin no banco de dados.")
        }
      } else {
        console.log(`❌ Usuário admin '${adminUsername}' não encontrado.`)
        console.log("\n❌ PROBLEMA DETECTADO: O usuário admin não existe no banco de dados.")
        console.log("   Solução: Crie o usuário admin no banco de dados.")
      }

      // Contar usuários
      const userCount = await usersCollection.countDocuments()
      console.log(`   Total de usuários: ${userCount}`)
    } else {
      console.log("❌ Coleção 'usuarios' não existe.")
      console.log("\n❌ PROBLEMA DETECTADO: A coleção 'usuarios' não existe no banco de dados.")
      console.log("   Solução: Inicialize o banco de dados para criar a coleção 'usuarios'.")
    }
  } catch (error) {
    console.log(`❌ Erro ao conectar ao MongoDB: ${error}`)
    console.log("\n❌ PROBLEMA DETECTADO: Não foi possível conectar ao MongoDB.")
    console.log("   Solução: Verifique a URI de conexão e certifique-se de que o MongoDB está acessível.")
  } finally {
    await client.close()
    console.log("Conexão com o MongoDB fechada.")
  }

  // Verificar rotas de API
  console.log("\n3. Verificação de rotas de API:")
  console.log("   Para testar a rota de login, execute:")
  console.log(
    `   curl -X POST https://seu-projeto.vercel.app/api/auth/login -H "Content-Type: application/json" -d '{"username":"${adminUsername}","password":"sua-senha"}'`,
  )

  console.log("\n=== FIM DO DIAGNÓSTICO ===")
}

// Executar diagnóstico
diagnoseLogin()
