import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

async function runResetAndSeed() {
  try {
    console.log("Iniciando reset do banco de dados...")
    const resetResult = await execAsync("npx ts-node scripts/reset-database.ts")
    console.log(resetResult.stdout)

    console.log("Iniciando alimentação do banco de dados...")
    const seedResult = await execAsync("npx ts-node scripts/seed-database.ts")
    console.log(seedResult.stdout)

    console.log("Processo concluído com sucesso!")
  } catch (error) {
    console.error("Erro ao executar scripts:", error)
  }
}

runResetAndSeed()
