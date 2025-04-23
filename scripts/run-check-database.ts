import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function runCheckDatabase() {
  try {
    console.log("Verificando conexão com o banco de dados...")
    const result = await execAsync("npx ts-node scripts/check-database-connection.ts")
    console.log(result.stdout)

    console.log("Verificação concluída com sucesso!")
  } catch (error) {
    console.error("Erro ao verificar conexão com o banco de dados:", error)
  }
}

runCheckDatabase()
