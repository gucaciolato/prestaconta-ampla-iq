import { NextResponse } from "next/server"
import { Pool } from "pg"

export async function GET() {
  try {
    console.log("[DEBUG-DB] Iniciando diagnóstico detalhado da conexão PostgreSQL")

    // Obter a URI do PostgreSQL das variáveis de ambiente
    const connectionString =
      process.env.DATABASE_URL ||
      "postgres://postgres:OaLT93JzubpZJlJiPpBEK5dCzPOmGlHvTho15gRtPIARjXsUc3b9qfqEwNRS61bC@69.62.98.199:5443/postgres"

    // Verificar se a URI está definida
    if (!connectionString) {
      console.error("[DEBUG-DB] DATABASE_URL não está definida nas variáveis de ambiente")
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_URL não está definida nas variáveis de ambiente",
          env: {
            DATABASE_URL: connectionString ? "Definida (valor oculto)" : "Não definida",
          },
        },
        { status: 500 },
      )
    }

    // Tentar analisar a URI para verificar se é válida
    let uriInfo = "Não foi possível analisar a URI"
    try {
      // Extrair informações da URI sem expor credenciais
      const regex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
      const match = connectionString.match(regex)

      if (match) {
        uriInfo = {
          user: match[1],
          host: match[3],
          port: match[4],
          database: match[5],
          hasCredentials: true,
        }
      } else {
        uriInfo = "Formato de URI não reconhecido"
      }
    } catch (e) {
      console.error("[DEBUG-DB] URI inválida:", e)
      return NextResponse.json(
        {
          success: false,
          error: "URI do PostgreSQL inválida",
          details: e instanceof Error ? e.message : String(e),
        },
        { status: 500 },
      )
    }

    console.log("[DEBUG-DB] Tentando conectar ao PostgreSQL...")

    // Tentar conectar ao PostgreSQL com timeout
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 5000,
    })

    const startTime = Date.now()
    const client = await pool.connect()
    const connectionTime = Date.now() - startTime

    console.log("[DEBUG-DB] Conexão estabelecida em", connectionTime, "ms")

    try {
      // Verificar se podemos acessar o banco de dados
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `)

      const tables = tablesResult.rows.map((row) => row.table_name)

      // Verificar se podemos executar um comando simples
      const pingResult = await client.query("SELECT 1 as ping")

      return NextResponse.json({
        success: true,
        message: "Conexão com PostgreSQL estabelecida com sucesso",
        connectionTime: `${connectionTime}ms`,
        uriInfo,
        database: {
          tables,
          tableCount: tables.length,
        },
        ping: pingResult.rows[0].ping === 1,
      })
    } finally {
      client.release()
      await pool.end()
    }
  } catch (error) {
    console.error("[DEBUG-DB] Erro ao conectar ao PostgreSQL:", error)

    // Extrair informações úteis do erro
    let errorDetails = "Erro desconhecido"
    let errorCode = "UNKNOWN"

    if (error instanceof Error) {
      errorDetails = error.message
      // Tentar extrair o código de erro do PostgreSQL
      const pgError = error as any
      if (pgError.code) {
        errorCode = pgError.code
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Falha ao conectar ao PostgreSQL",
        errorCode,
        details: errorDetails,
        env: {
          DATABASE_URL: process.env.DATABASE_URL ? "Definida (valor oculto)" : "Não definida",
          NODE_ENV: process.env.NODE_ENV || "Não definido",
        },
      },
      { status: 500 },
    )
  }
}
