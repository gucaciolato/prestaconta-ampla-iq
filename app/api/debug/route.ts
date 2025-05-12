import { NextResponse } from "next/server"
import { query } from "@/lib/postgres-service"

export async function GET() {
  try {
    console.log("[DEBUG] Iniciando diagnóstico da aplicação")

    // Verificar conexão com o banco de dados
    let dbStatus = "unknown"
    let dbError = null
    let tables = []

    try {
      // Testar conexão com o banco de dados
      const result = await query("SELECT 1 as test")
      dbStatus = result.rows[0].test === 1 ? "connected" : "error"

      // Listar tabelas
      const tablesResult = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `)
      tables = tablesResult.rows.map((row) => row.table_name)
    } catch (err) {
      dbStatus = "error"
      dbError = err instanceof Error ? err.message : String(err)
    }

    // Verificar variáveis de ambiente
    const envVars = {
      NODE_ENV: process.env.NODE_ENV || "development",
      DATABASE_URL: process.env.DATABASE_URL ? "Definida (valor oculto)" : "Não definida",
      JWT_SECRET: process.env.JWT_SECRET ? "Definida (valor oculto)" : "Não definida",
      NEXT_PUBLIC_USUARIO_LOGIN: process.env.NEXT_PUBLIC_USUARIO_LOGIN || "Não definido",
    }

    // Verificar configuração do servidor
    const serverInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
    }

    return NextResponse.json({
      status: "ok",
      database: {
        status: dbStatus,
        error: dbError,
        tables,
      },
      environment: envVars,
      server: serverInfo,
    })
  } catch (error) {
    console.error("[DEBUG] Erro ao executar diagnóstico:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao executar diagnóstico",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
