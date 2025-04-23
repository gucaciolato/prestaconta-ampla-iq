import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/mongodb-service"
import { initializeUsers } from "@/lib/auth-service"

export async function GET() {
  try {
    console.log("Inicializando banco de dados...")

    // Inicializar o banco de dados
    await initializeDatabase()

    // Inicializar usuários
    await initializeUsers()

    return NextResponse.json({ success: true, message: "Banco de dados inicializado com sucesso" })
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error)
    return NextResponse.json({ success: false, message: "Erro ao inicializar banco de dados" }, { status: 500 })
  }
}
