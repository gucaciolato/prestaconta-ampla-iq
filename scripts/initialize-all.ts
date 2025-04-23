import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function initializeAll() {
  try {
    console.log("Verificando conexão com o banco de dados...")
    await execAsync("npx ts-node scripts/check-database-connection.ts")

    console.log("\nResetando banco de dados...")
    await execAsync("npx ts-node scripts/reset-database.ts")

    console.log("\nAlimentando banco de dados...")
    await execAsync("npx ts-node scripts/seed-database.ts")

    console.log("\nVerificando banco de dados após inicialização...")
    await execAsync("npx ts-node scripts/check-database-connection.ts")

    console.log("\nTodos os scripts foram executados com sucesso!")
  } catch (error) {
    console.error("Erro ao executar scripts:", error)
  }
}

initializeAll()
