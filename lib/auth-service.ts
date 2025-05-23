"use server"

import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { redirect } from "next/navigation"
import type { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import type { UserRole } from "./types"
// Importar o serviço PostgreSQL
import { query } from "./postgres-service"

const JWT_SECRET = process.env.JWT_SECRET || "seu_segredo_jwt_super_secreto"

export interface UserJwtPayload {
  id: string
  username: string
  nome: string
  email: string
  role: string
  ativo: boolean
}

// Função de autenticação adaptada para PostgreSQL
export async function authenticateUser(username: string, password: string) {
  try {
    console.log(`Auth Service: Tentando autenticar usuário: ${username}`)

    // Verificar se a tabela existe
    const tablesResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      )
    `)

    const tableExists = tablesResult.rows[0].exists
    if (!tableExists) {
      console.error("Auth Service: Tabela 'usuarios' não existe")
      return { success: false, message: "Erro de configuração do servidor" }
    }

    // Buscar o usuário
    const userResult = await query("SELECT * FROM usuarios WHERE username = $1", [username])

    if (userResult.rowCount === 0) {
      console.log(`Auth Service: Usuário não encontrado: ${username}`)
      return { success: false, message: "Usuário não encontrado" }
    }

    const user = userResult.rows[0]
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
      id: user.id.toString(),
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
        id: user.id.toString(),
        username: user.username,
        nome: user.nome || "Usuário",
        email: user.email || "",
        role: user.role,
        ativo: user.ativo,
      },
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

// Função para inicializar usuários adaptada para PostgreSQL
export async function initializeUsers() {
  try {
    console.log("Inicializando usuários...")

    // Verificar se a tabela existe
    const tablesResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      )
    `)

    const tableExists = tablesResult.rows[0].exists
    if (!tableExists) {
      console.log("Tabela 'usuarios' não existe, criando...")
      await query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          nome VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          role VARCHAR(50) NOT NULL,
          ativo BOOLEAN DEFAULT true,
          data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    // Verificar se existe algum usuário
    const countResult = await query("SELECT COUNT(*) FROM usuarios")
    const count = Number.parseInt(countResult.rows[0].count)
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

      await query(
        `INSERT INTO usuarios (username, password, nome, email, role, ativo)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [adminUsername, hashedPassword, "Administrador", "admin@prestaconta.com", "admin", true],
      )

      console.log("Usuário admin padrão criado com sucesso!")

      // Verificar se o usuário admin foi criado corretamente
      const adminResult = await query("SELECT * FROM usuarios WHERE username = $1", [adminUsername])

      if (adminResult.rowCount > 0) {
        const adminUser = adminResult.rows[0]
        console.log("Verificação: Usuário admin existe no banco de dados")
        console.log({
          id: adminUser.id,
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

      const adminResult = await query("SELECT * FROM usuarios WHERE username = $1", [adminUsername])

      if (adminResult.rowCount === 0) {
        console.log(`Usuário admin ${adminUsername} não encontrado, criando...`)

        const adminPassword = process.env.NEXT_PUBLIC_SENHA_LOGIN

        if (!adminPassword) {
          console.error("NEXT_PUBLIC_SENHA_LOGIN não está definido")
          return
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10)

        await query(
          `INSERT INTO usuarios (username, password, nome, email, role, ativo)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [adminUsername, hashedPassword, "Administrador", "admin@prestaconta.com", "admin", true],
        )

        console.log("Usuário admin padrão criado com sucesso!")
      } else {
        console.log(`Usuário admin ${adminUsername} já existe`)
      }
    }
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
  try {
    const result = await query("SELECT EXISTS(SELECT 1 FROM usuarios WHERE username = $1)", [username])
    return result.rows[0].exists
  } catch (error) {
    console.error("Erro ao verificar se usuário existe:", error)
    return false
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
  try {
    // Verificar se o usuário já existe
    const exists = await userExists(userData.username)
    if (exists) {
      return { success: false, message: "Usuário já existe" }
    }

    // Hash da senha
    const hashedPassword = await hashPassword(userData.password)

    // Criar o usuário
    const result = await query(
      `INSERT INTO usuarios (username, password, nome, email, role, ativo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [userData.username, hashedPassword, userData.nome, userData.email, userData.role, true],
    )

    return {
      success: true,
      userId: result.rows[0].id.toString(),
    }
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return { success: false, message: "Erro ao criar usuário" }
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
  try {
    // Preparar os campos para atualização
    const updates = []
    const values = []
    let paramIndex = 1

    if (userData.nome) {
      updates.push(`nome = $${paramIndex}`)
      values.push(userData.nome)
      paramIndex++
    }

    if (userData.email) {
      updates.push(`email = $${paramIndex}`)
      values.push(userData.email)
      paramIndex++
    }

    if (userData.role) {
      updates.push(`role = $${paramIndex}`)
      values.push(userData.role)
      paramIndex++
    }

    if (userData.ativo !== undefined) {
      updates.push(`ativo = $${paramIndex}`)
      values.push(userData.ativo)
      paramIndex++
    }

    if (userData.password) {
      const hashedPassword = await hashPassword(userData.password)
      updates.push(`password = $${paramIndex}`)
      values.push(hashedPassword)
      paramIndex++
    }

    if (updates.length === 0) {
      return { success: true, message: "Nenhuma alteração feita" }
    }

    // Adicionar o ID ao final dos valores
    values.push(Number.parseInt(id))

    // Atualizar o usuário
    const result = await query(
      `UPDATE usuarios
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex}`,
      values,
    )

    return {
      success: result.rowCount > 0,
      message: result.rowCount > 0 ? "Usuário atualizado com sucesso" : "Nenhuma alteração feita",
    }
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return { success: false, message: "Erro ao atualizar usuário" }
  }
}

// Função para obter todos os usuários
export async function getAllUsers() {
  try {
    const result = await query("SELECT id, username, nome, email, role, ativo, data_criacao FROM usuarios")

    return result.rows.map((user) => ({
      ...user,
      id: user.id.toString(),
    }))
  } catch (error) {
    console.error("Erro ao obter todos os usuários:", error)
    return []
  }
}

// Função para obter um usuário por ID
export async function getUserById(id: string) {
  try {
    const result = await query(
      "SELECT id, username, nome, email, role, ativo, data_criacao FROM usuarios WHERE id = $1",
      [Number.parseInt(id)],
    )

    if (result.rowCount === 0) {
      return null
    }

    const user = result.rows[0]
    return {
      ...user,
      id: user.id.toString(),
    }
  } catch (error) {
    console.error("Erro ao obter usuário por ID:", error)
    return null
  }
}

// Função para desativar um usuário
export async function deactivateUser(id: string) {
  try {
    const result = await query("UPDATE usuarios SET ativo = false WHERE id = $1", [Number.parseInt(id)])
    return result.rowCount > 0
  } catch (error) {
    console.error("Erro ao desativar usuário:", error)
    return false
  }
}

// Função para ativar um usuário
export async function activateUser(id: string) {
  try {
    const result = await query("UPDATE usuarios SET ativo = true WHERE id = $1", [Number.parseInt(id)])
    return result.rowCount > 0
  } catch (error) {
    console.error("Erro ao ativar usuário:", error)
    return false
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
