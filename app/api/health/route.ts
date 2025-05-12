import { NextResponse } from "next/server"
import { checkDatabaseHealth } from "@/lib/postgres-service"

export async function GET() {
  try {
    console.log("[HEALTH] Verificando saúde da aplicação")

    // Verificar a saúde do banco de dados
    const dbHealth = await checkDatabaseHealth()

    // Verificar a versão do Node.js
    const nodeVersion = process.version

    // Verificar o ambiente
    const environment = process.env.NODE_ENV || "development"

    // Verificar o tempo de atividade do servidor
    const uptime = process.uptime()

    // Verificar a memória utilizada
    const memoryUsage = process.memoryUsage()

    const healthStatus = {
      status: dbHealth.status === "ok" ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "unknown",
      environment,
      uptime: `${Math.floor(uptime / 60)} minutos, ${Math.floor(uptime % 60)} segundos`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
      database: dbHealth,
    }

    console.log("[HEALTH] Status da aplicação:", healthStatus.status)
    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error("[HEALTH] Erro ao verificar saúde da aplicação:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Erro ao verificar saúde da aplicação",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
