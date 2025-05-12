import { NextResponse } from "next/server"
import { getConnection } from "@/lib/postgres-service"

export async function GET() {
  try {
    console.log("[CONNECTION-TEST] Iniciando teste de conexão")

    // Tenta estabelecer uma conexão com o PostgreSQL
    const startTime = Date.now()
    const client = await getConnection()
    const connectionTime = Date.now() - startTime

    try {
      // Executa um comando simples para verificar se a conexão está funcionando
      const pingResult = await client.query("SELECT 1 as ping")

      // Obtém informações sobre o servidor
      const serverInfoResult = await client.query("SELECT version()")
      const serverInfo = serverInfoResult.rows[0].version

      // Obtém estatísticas do banco de dados
      const dbStatsResult = await client.query(`
        SELECT 
          count(*) as total_tables
        FROM 
          information_schema.tables 
        WHERE 
          table_schema = 'public'
      `)

      const dbStats = dbStatsResult.rows[0]

      console.log("[CONNECTION-TEST] Teste de conexão bem-sucedido")
      return NextResponse.json({
        success: true,
        message: "Conexão com o PostgreSQL estabelecida com sucesso",
        connectionTime: `${connectionTime}ms`,
        ping: pingResult.rows[0].ping === 1,
        serverVersion: serverInfo,
        dbStats: {
          tables: Number.parseInt(dbStats.total_tables),
        },
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("[CONNECTION-TEST] Erro no teste de conexão:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Falha ao conectar com o PostgreSQL",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
