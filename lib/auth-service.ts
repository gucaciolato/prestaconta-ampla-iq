"use server"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { redirect } from "next/navigation"
import { ObjectId } from "mongodb"
import type { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import type { UserRole } from "./types"
import { MongoClient } from "mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "seu_segredo_jwt_super_secreto"
const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "prestaconta"

export interface UserJwtPayload {
  id: string
  username: string
  nome: string
  email: string
  role: string
  ativo: boolean
}

// Função para autenticar um usuário
export async function authenticateUser(username: string, password: string) {
  try {
    console.log(`Auth Service: Tentando autenticar usuário: ${username}`)
    console.log(`Auth Service: URI: ${uri}`)
    console.log(`Auth Service: DB: ${dbName}`)

    if (!uri) {
      console.error("Auth Service: MONGODB_URI não está definido")
      return { success: false, message: "Erro de configuração do servidor" }
    }

    const client = new MongoClient(uri)

    try {
      await client.connect()
      console.log("Auth Service: Conectado ao MongoDB")

      const db = client.db(dbName)
      const usersCollection = db.collection("usuarios")

      // Verificar se a coleção existe
      const collections = await db.listCollections().toArray()
      const hasUsersCollection = collections.some((col) => col.name === "usuarios")

      if (!hasUsersCollection) {
        console.error("Auth Service: Coleção 'usuarios' não existe")
        return { success: false, message: "Erro de configuração do servidor" }
      }

      // Buscar o usuário
      const user = await usersCollection.findOne({ username })

      if (!user) {
        console.log(`Auth Service: Usuário não encontrado: ${username}`)
        return { success: false, message: "Usuário não encontrado" }
      }

      console.log(`Auth Service: Usuário encontrado: ${username}, role: ${user.role}, ativo: ${user.ativo}`)

      if (!user.ativo) {
        console.log(`Auth Service: Usuário inativo: ${username}`)
        return { success: false, message: "Usuário inativo" }
      }

      // Verificar a senha
      console.log(`Auth Service: Verificando senha para: ${username}`)
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        console.log(`Auth Service: Senha incorreta para: ${username}`)
        return { success: false, message: "Senha incorreta" }
      }

      console.log(`Auth Service: Senha válida para: ${username}, gerando token JWT`)

      // Gerar token JWT
      const token = await signJWT({
        id: user._id.toString(),
        username: user.username,
        nome: user.nome || "Usuário",
        email: user.email || "",
        role: user.role,
        ativo: user.ativo,
      })

      // Definir o token nos cookies
      await setJwtCookie(token)

      console.log(`Auth Service: Login bem-sucedido para: ${username}`)

      return {
        success: true,
        user: {
          id: user._id.toString(),
          username: user.username,
          nome: user.nome || "Usuário",
          email: user.email || "",
          role: user.role,
          ativo: user.ativo,
        },
      }
    } finally {
      await client.close()
      console.log("Auth Service: Conexão com o MongoDB fechada")
    }
  } catch (error) {
    console.error("Auth Service: Erro ao autenticar usuário:", error)
    return { success: false, message: "Erro ao autenticar usuário" }
  }
}

// Função para gerar um token JWT usando jose
export async function signJWT(payload: UserJwtPayload) {
  const secret = new TextEncoder().encode(JWT_SECRET)

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // Token expira em 24 horas
    .sign(secret)

  return token
}

// Função para verificar um token JWT
export async function verifyJWT(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    return payload as UserJwtPayload
  } catch (error) {
    return null
  }
}

// Função para obter o token JWT dos cookies
export async function getJwtFromCookies() {
  const cookieStore = cookies()
  return cookieStore.get("auth-token")?.value
}

// Função para definir o token JWT nos cookies
export async function setJwtCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 dia
    path: "/",
  })
}

// Função para remover o token JWT dos cookies
export async function removeJwtCookie() {
  const cookieStore = cookies()
  cookieStore.delete("auth-token")
}

// Função para inicializar usuários
export async function initializeUsers() {
  try {
    console.log("Inicializando usuários...")

    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(dbName)
    const usersCollection = db.collection("usuarios")

    // Verificar se existe algum usuário
    const count = await usersCollection.countDocuments()
    console.log(`Número de usuários encontrados: ${count}`)

    if (count === 0) {
      console.log("Nenhum usuário encontrado, criando usuário admin padrão...")

      // Criar o usuário admin padrão
      const adminUsername = process.env.NEXT_PUBLIC_USUARIO_LOGIN
      const adminPassword = process.env.NEXT_PUBLIC_SENHA_LOGIN

      if (!adminUsername || !adminPassword) {
        console.error("NEXT_PUBLIC_USUARIO_LOGIN ou NEXT_PUBLIC_SENHA_LOGIN não estão definidos")
        return
      }

      console.log(`Criando usuário admin: ${adminUsername}`)
      const hashedPassword = await bcrypt.hash(adminPassword, 10)

      await usersCollection.insertOne({
        username: adminUsername,
        password: hashedPassword,
        nome: "Administrador",
        email: "admin@prestaconta.com",
        role: "admin",
        ativo: true,
        dataCriacao: new Date(),
      })

      console.log("Usuário admin padrão criado com sucesso!")

      // Verificar se o usuário admin foi criado corretamente
      const adminUser = await usersCollection.findOne({ username: adminUsername })
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
    } else {
      console.log("Usuários já existem, verificando usuário admin...")

      // Verificar se o usuário admin existe
      const adminUsername = process.env.NEXT_PUBLIC_USUARIO_LOGIN

      if (!adminUsername) {
        console.error("NEXT_PUBLIC_USUARIO_LOGIN não está definido")
        return
      }

      const adminUser = await usersCollection.findOne({ username: adminUsername })

      if (!adminUser) {
        console.log(`Usuário admin ${adminUsername} não encontrado, criando...`)

        const adminPassword = process.env.NEXT_PUBLIC_SENHA_LOGIN

        if (!adminPassword) {
          console.error("NEXT_PUBLIC_SENHA_LOGIN não está definido")
          return
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10)

        await usersCollection.insertOne({
          username: adminUsername,
          password: hashedPassword,
          nome: "Administrador",
          email: "admin@prestaconta.com",
          role: "admin",
          ativo: true,
          dataCriacao: new Date(),
        })

        console.log("Usuário admin padrão criado com sucesso!")
      } else {
        console.log(`Usuário admin ${adminUsername} já existe`)
      }
    }

    await client.close()
  } catch (error) {
    console.error("Erro ao inicializar usuários:", error)
  }
}

// Função para obter o usuário atual
export async function getCurrentUser() {
  const token = await getJwtFromCookies()
  if (!token) return null

  const payload = await verifyJWT(token)
  if (!payload) return null

  return payload
}

// Função para verificar se o usuário tem uma determinada permissão
export async function hasPermission(permission: string) {
  const user = await getCurrentUser()
  if (!user) return false

  // Mapeamento de papéis para permissões
  const rolePermissions: Record<string, string[]> = {
    admin: ["*"], // Admin tem todas as permissões
    editor: [
      "dashboard:view",
      "avisos:manage",
      "galeria:manage",
      "documentos:manage",
      "diretoria:manage",
      "relatorios:manage",
      "atividades:manage",
    ],
    viewer: [
      "dashboard:view",
      "avisos:view",
      "galeria:view",
      "documentos:view",
      "diretoria:view",
      "relatorios:view",
      "atividades:view",
    ],
  }

  const userPermissions = rolePermissions[user.role] || []

  // Se o usuário tem a permissão "*", ele tem todas as permissões
  if (userPermissions.includes("*")) return true

  // Verificar se o usuário tem a permissão específica
  return userPermissions.includes(permission)
}

// Função para verificar se o usuário está autenticado e redirecionar se não estiver
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

// Função para verificar se o usuário tem uma determinada permissão e redirecionar se não tiver
export async function requirePermission(permission: string) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const hasUserPermission = await hasPermission(permission)
  if (!hasUserPermission) {
    redirect("/dashboard")
  }

  return user
}

// Função para obter o usuário a partir de uma requisição
export async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  const payload = await verifyJWT(token)
  return payload
}

// Função para criar um hash de senha
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

// Função para verificar se um usuário existe
export async function userExists(username: string) {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)
    const usersCollection = db.collection("usuarios")
    const user = await usersCollection.findOne({ username })
    return !!user
  } finally {
    await client.close()
  }
}

// Função para criar um usuário
export async function createUser(userData: {
  username: string
  password: string
  nome: string
  email: string
  role: string
}) {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)
    const usersCollection = db.collection("usuarios")

    // Verificar se o usuário já existe
    const existingUser = await usersCollection.findOne({ username: userData.username })
    if (existingUser) {
      return { success: false, message: "Usuário já existe" }
    }

    // Hash da senha
    const hashedPassword = await hashPassword(userData.password)

    // Criar o usuário
    const result = await usersCollection.insertOne({
      ...userData,
      password: hashedPassword,
      ativo: true,
      createdAt: new Date(),
    })

    return {
      success: true,
      userId: result.insertedId.toString(),
    }
  } finally {
    await client.close()
  }
}

// Função para atualizar um usuário
export async function updateUser(
  id: string,
  userData: {
    nome?: string
    email?: string
    role?: string
    ativo?: boolean
    password?: string
  },
) {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)
    const usersCollection = db.collection("usuarios")

    const updateData: any = { ...userData }

    // Se a senha foi fornecida, hash ela
    if (userData.password) {
      updateData.password = await hashPassword(userData.password)
    }

    // Atualizar o usuário
    const result = await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return {
      success: result.modifiedCount > 0,
      message: result.modifiedCount > 0 ? "Usuário atualizado com sucesso" : "Nenhuma alteração feita",
    }
  } finally {
    await client.close()
  }
}

// Função para obter todos os usuários
export async function getAllUsers() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)
    const usersCollection = db.collection("usuarios")
    const users = await usersCollection.find({}).toArray()

    return users.map((user) => {
      const { password, ...userWithoutPassword } = user
      return {
        ...userWithoutPassword,
        id: user._id.toString(),
      }
    })
  } finally {
    await client.close()
  }
}

// Função para obter um usuário pelo ID
export async function getUserById(id: string) {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)
    const usersCollection = db.collection("usuarios")
    const user = await usersCollection.findOne({ _id: new ObjectId(id) })

    if (!user) {
      return null
    }

    const { password, ...userWithoutPassword } = user
    return {
      ...userWithoutPassword,
      id: user._id.toString(),
    }
  } finally {
    await client.close()
  }
}

// Função para desativar um usuário
export async function deactivateUser(id: string) {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)
    const usersCollection = db.collection("usuarios")
    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { ativo: false } })
    return true
  } finally {
    await client.close()
  }
}

// Função para ativar um usuário
export async function activateUser(id: string) {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)
    const usersCollection = db.collection("usuarios")
    await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { ativo: true } })
    return true
  } finally {
    await client.close()
  }
}

// Importação do jwt para compatibilidade com o código existente
import * as jwt from "jsonwebtoken"

// Função para gerar um token JWT - convertida para async
export async function generateToken(user: { id: string; username: string; role: UserRole }) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}
