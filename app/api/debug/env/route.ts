import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar variáveis de ambiente críticas
    const envVars = {
      MONGODB_URI: process.env.MONGODB_URI ? "Definida (valor oculto)" : "Não definida",
      MONGODB_DB: process.env.MONGODB_DB || "Não definido",
      MINIO_URL: process.env.MINIO_URL ? "Definida (valor oculto)" : "Não definida",
      MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY ? "Definida (valor oculto)" : "Não definida",
      MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY ? "Definida (valor oculto)" : "Não definida",
      JWT_SECRET: process.env.JWT_SECRET ? "Definida (valor oculto)" : "Não definida",
      NODE_ENV: process.env.NODE_ENV || "Não definido",
      VERCEL_ENV: process.env.VERCEL_ENV || "Não definido",
      VERCEL_URL: process.env.VERCEL_URL || "Não definido",
    }

    // Verificar se as variáveis críticas estão definidas
    const missingVars = Object.entries(envVars)
      .filter(([key, value]) => value === "Não definida" && ["MONGODB_URI", "MONGODB_DB", "JWT_SECRET"].includes(key))
      .map(([key]) => key)

    return NextResponse.json({
      success: missingVars.length === 0,
      environment: process.env.NODE_ENV || "development",
      variables: envVars,
      missingCriticalVars: missingVars,
      message:
        missingVars.length > 0
          ? `Variáveis de ambiente críticas não definidas: ${missingVars.join(", ")}`
          : "Todas as variáveis de ambiente críticas estão definidas",
    })
  } catch (error) {
    console.error("[DEBUG-ENV] Erro ao verificar variáveis de ambiente:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao verificar variáveis de ambiente",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
