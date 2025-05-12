import { Pool, type PoolClient } from "pg"

// Conexão com o PostgreSQL
const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:OaLT93JzubpZJlJiPpBEK5dCzPOmGlHvTho15gRtPIARjXsUc3b9qfqEwNRS61bC@69.62.98.199:5443/postgres"

// Criar pool de conexões
const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
})

// Verificar conexão ao inicializar
pool
  .connect()
  .then((client) => {
    console.log("Conexão com PostgreSQL estabelecida com sucesso!")
    client.release()
  })
  .catch((err) => {
    console.error("Erro ao conectar ao PostgreSQL:", err)
  })

// Função para obter uma conexão do pool
export async function getConnection(): Promise<PoolClient> {
  try {
    const client = await pool.connect()
    return client
  } catch (error) {
    console.error("Erro ao obter conexão do pool:", error)
    throw new Error("Erro ao conectar ao PostgreSQL")
  }
}

// Função para executar uma consulta
export async function query(text: string, params: any[] = []) {
  const client = await getConnection()
  try {
    const result = await client.query(text, params)
    return result
  } catch (error) {
    console.error("Erro ao executar consulta:", error)
    throw error
  } finally {
    client.release()
  }
}

// Função para inicializar o banco de dados
export async function initializeDatabase() {
  try {
    console.log("[POSTGRES] Inicializando banco de dados...")

    // Criar tabelas necessárias
    await createTables()

    console.log("[POSTGRES] Banco de dados inicializado com sucesso!")
    return true
  } catch (error) {
    console.error("[POSTGRES] Erro ao inicializar banco de dados:", error)
    throw error
  }
}

// Função para criar as tabelas necessárias
async function createTables() {
  const client = await getConnection()
  try {
    await client.query("BEGIN")

    // Tabela de usuários
    await client.query(`
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

    // Tabela de avisos
    await client.query(`
      CREATE TABLE IF NOT EXISTS avisos (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        conteudo TEXT NOT NULL,
        periodo_inscricao VARCHAR(255),
        documentos TEXT,
        data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        destaque BOOLEAN DEFAULT false,
        imagem VARCHAR(255),
        arquivo_id VARCHAR(255),
        arquivo_nome VARCHAR(255),
        arquivo_tipo VARCHAR(100),
        file_id VARCHAR(255)
      )
    `)

    // Tabela de atividades
    await client.query(`
      CREATE TABLE IF NOT EXISTS atividades (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        data_atividade TIMESTAMP NOT NULL,
        local VARCHAR(255),
        data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Tabela de fotos de atividades
    await client.query(`
      CREATE TABLE IF NOT EXISTS atividades_fotos (
        id SERIAL PRIMARY KEY,
        atividade_id INTEGER REFERENCES atividades(id) ON DELETE CASCADE,
        file_id VARCHAR(255),
        nome VARCHAR(255),
        tipo VARCHAR(100),
        url VARCHAR(255)
      )
    `)

    // Tabela de financeiro
    await client.query(`
      CREATE TABLE IF NOT EXISTS financeiro (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        data DATE NOT NULL,
        categoria VARCHAR(100),
        fonte VARCHAR(255),
        observacoes TEXT,
        ano VARCHAR(4),
        mes VARCHAR(2)
      )
    `)

    // Tabela de galeria
    await client.query(`
      CREATE TABLE IF NOT EXISTS galeria (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        data DATE NOT NULL,
        url VARCHAR(255) NOT NULL,
        ano VARCHAR(4),
        mes VARCHAR(2),
        file_id VARCHAR(255)
      )
    `)

    // Tabela de documentos
    await client.query(`
      CREATE TABLE IF NOT EXISTS documentos (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        ano VARCHAR(4),
        mes VARCHAR(2),
        url VARCHAR(255) NOT NULL,
        file_id VARCHAR(255)
      )
    `)

    // Tabela de diretoria
    await client.query(`
      CREATE TABLE IF NOT EXISTS diretoria (
        id SERIAL PRIMARY KEY,
        mandato VARCHAR(255) NOT NULL
      )
    `)

    // Tabela de membros da diretoria
    await client.query(`
      CREATE TABLE IF NOT EXISTS diretoria_membros (
        id SERIAL PRIMARY KEY,
        diretoria_id INTEGER REFERENCES diretoria(id) ON DELETE CASCADE,
        nome VARCHAR(255) NOT NULL,
        cargo VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL
      )
    `)

    await client.query("COMMIT")
    console.log("[POSTGRES] Tabelas criadas com sucesso")
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("[POSTGRES] Erro ao criar tabelas:", error)
    throw error
  } finally {
    client.release()
  }
}

// Função para verificar a saúde do banco de dados
export async function checkDatabaseHealth() {
  try {
    const client = await getConnection()
    try {
      await client.query("SELECT 1")
      return { status: "ok", message: "Conexão com o banco de dados está ativa" }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[POSTGRES] Erro ao verificar saúde do banco de dados:", error)
    return {
      status: "error",
      message: "Erro na conexão com o banco de dados",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Funções equivalentes às do MongoDB para manter compatibilidade

// Função para buscar todos os registros de uma tabela
export async function findAll(table: string, filters: Record<string, any> = {}, sort: Record<string, number> = {}) {
  try {
    console.log(`[POSTGRES] Buscando registros na tabela ${table}`, { filters, sort })

    // Construir a consulta SQL
    let query = `SELECT * FROM ${table}`
    const params: any[] = []

    // Adicionar filtros WHERE
    if (Object.keys(filters).length > 0) {
      const conditions = []
      let paramIndex = 1

      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          conditions.push(`${key} = $${paramIndex}`)
          params.push(value)
          paramIndex++
        }
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
      }
    }

    // Adicionar ordenação
    if (Object.keys(sort).length > 0) {
      const orderClauses = []

      for (const [key, value] of Object.entries(sort)) {
        orderClauses.push(`${key} ${value === 1 ? "ASC" : "DESC"}`)
      }

      if (orderClauses.length > 0) {
        query += ` ORDER BY ${orderClauses.join(", ")}`
      }
    }

    const result = await pool.query(query, params)
    console.log(`[POSTGRES] Encontrados ${result.rowCount} registros na tabela ${table}`)

    return result.rows
  } catch (error) {
    console.error(`[POSTGRES] Erro ao buscar registros na tabela ${table}:`, error)
    throw error
  }
}

// Função para buscar um registro específico
export async function findOne(table: string, filters: Record<string, any> = {}) {
  try {
    console.log(`[POSTGRES] Buscando um registro na tabela ${table}`, { filters })

    // Construir a consulta SQL
    let query = `SELECT * FROM ${table}`
    const params: any[] = []

    // Adicionar filtros WHERE
    if (Object.keys(filters).length > 0) {
      const conditions = []
      let paramIndex = 1

      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          conditions.push(`${key} = $${paramIndex}`)
          params.push(value)
          paramIndex++
        }
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
      }
    }

    query += " LIMIT 1"

    const result = await pool.query(query, params)
    console.log(`[POSTGRES] Registro encontrado na tabela ${table}:`, result.rowCount > 0 ? "sim" : "não")

    return result.rowCount > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`[POSTGRES] Erro ao buscar registro na tabela ${table}:`, error)
    throw error
  }
}

// Função para inserir um registro
export async function insertOne(table: string, data: Record<string, any>) {
  try {
    console.log(`[POSTGRES] Inserindo registro na tabela ${table}`, data)

    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ")

    const query = `
      INSERT INTO ${table} (${keys.join(", ")})
      VALUES (${placeholders})
      RETURNING id
    `

    const result = await pool.query(query, values)
    console.log(`[POSTGRES] Registro inserido na tabela ${table} com ID:`, result.rows[0].id)

    return { insertedId: result.rows[0].id }
  } catch (error) {
    console.error(`[POSTGRES] Erro ao inserir registro na tabela ${table}:`, error)
    throw error
  }
}

// Função para atualizar um registro
export async function updateOne(table: string, filters: Record<string, any>, data: Record<string, any>) {
  try {
    console.log(`[POSTGRES] Atualizando registro na tabela ${table}`, { filters, data })

    // Construir a parte SET da consulta
    const setClause = []
    const values = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(data)) {
      setClause.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }

    // Construir a parte WHERE da consulta
    const whereClause = []

    for (const [key, value] of Object.entries(filters)) {
      whereClause.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }

    const query = `
      UPDATE ${table}
      SET ${setClause.join(", ")}
      WHERE ${whereClause.join(" AND ")}
    `

    const result = await pool.query(query, values)
    console.log(`[POSTGRES] Registro atualizado na tabela ${table}:`, {
      matched: result.rowCount,
      modified: result.rowCount,
    })

    return { matchedCount: result.rowCount, modifiedCount: result.rowCount }
  } catch (error) {
    console.error(`[POSTGRES] Erro ao atualizar registro na tabela ${table}:`, error)
    throw error
  }
}

// Função para excluir um registro
export async function deleteOne(table: string, filters: Record<string, any>) {
  try {
    console.log(`[POSTGRES] Excluindo registro da tabela ${table}`, { filters })

    // Construir a parte WHERE da consulta
    const whereClause = []
    const values = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(filters)) {
      whereClause.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }

    const query = `
      DELETE FROM ${table}
      WHERE ${whereClause.join(" AND ")}
    `

    const result = await pool.query(query, values)
    console.log(`[POSTGRES] Registro excluído da tabela ${table}:`, {
      deleted: result.rowCount,
    })

    return { deletedCount: result.rowCount }
  } catch (error) {
    console.error(`[POSTGRES] Erro ao excluir registro da tabela ${table}:`, error)
    throw error
  }
}

// Função para obter uma coleção (tabela)
export async function getCollection(table: string) {
  // No PostgreSQL, não temos o conceito de "collection" como no MongoDB
  // Então vamos retornar um objeto que simula a API do MongoDB
  return {
    find: (filters: Record<string, any> = {}) => ({
      sort: (sort: Record<string, number> = {}) => ({
        toArray: async () => {
          return await findAll(table, filters, sort)
        },
      }),
      limit: (limit: number) => ({
        toArray: async () => {
          const result = await pool.query(`SELECT * FROM ${table} LIMIT $1`, [limit])
          return result.rows
        },
      }),
      toArray: async () => {
        return await findAll(table, filters)
      },
    }),
    findOne: async (filters: Record<string, any> = {}) => {
      return await findOne(table, filters)
    },
    insertOne: async (data: Record<string, any>) => {
      return await insertOne(table, data)
    },
    updateOne: async (filters: Record<string, any>, update: Record<string, any>) => {
      return await updateOne(table, filters, update)
    },
    deleteOne: async (filters: Record<string, any>) => {
      return await deleteOne(table, filters)
    },
    countDocuments: async (filters: Record<string, any> = {}) => {
      try {
        let query = `SELECT COUNT(*) FROM ${table}`
        const params: any[] = []

        if (Object.keys(filters).length > 0) {
          const conditions = []
          let paramIndex = 1

          for (const [key, value] of Object.entries(filters)) {
            conditions.push(`${key} = $${paramIndex}`)
            params.push(value)
            paramIndex++
          }

          if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`
          }
        }

        const result = await pool.query(query, params)
        return Number.parseInt(result.rows[0].count)
      } catch (error) {
        console.error(`[POSTGRES] Erro ao contar registros na tabela ${table}:`, error)
        throw error
      }
    },
  }
}

// Função para obter o banco de dados
export async function getDatabase() {
  // No PostgreSQL, não temos o conceito de "database" como objeto no MongoDB
  // Então vamos retornar um objeto que simula a API do MongoDB
  return {
    collection: (table: string) => getCollection(table),
    listCollections: async () => {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `)
      return result.rows.map((row) => ({ name: row.table_name }))
    },
    createCollection: async (table: string) => {
      await pool.query(`CREATE TABLE IF NOT EXISTS ${table} (id SERIAL PRIMARY KEY)`)
      return true
    },
    command: async (command: any) => {
      if (command.ping) {
        await pool.query("SELECT 1")
        return { ok: 1 }
      }
      return { ok: 0 }
    },
  }
}

// Alias para getDatabase para compatibilidade
export async function getDb() {
  return getDatabase()
}

// Função para converter string para ID
export function toObjectId(id: string) {
  // No PostgreSQL, usamos IDs numéricos, então vamos apenas converter para número
  return Number.parseInt(id)
}
