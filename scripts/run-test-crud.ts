import { spawn } from "child_process"
import path from "path"
import { fileURLToPath } from "url"

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carregar variáveis de ambiente de .env se existir
try {
  const dotenv = await import("dotenv")
  dotenv.config()
  console.log("Variáveis de ambiente carregadas do arquivo .env")
} catch (error) {
  console.log("Arquivo .env não encontrado ou erro ao carregar")
}

// Verificar variáveis de ambiente necessárias
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI não está definido")
  process.exit(1)
}

if (!process.env.MONGODB_DB) {
  console.error("MONGODB_DB não está definido")
  process.exit(1)
}

console.log("Executando teste de operações CRUD...")

// Executar o script de teste
const scriptPath = path.join(__dirname, "test-crud-operations.ts")
const child = spawn("npx", ["ts-node", scriptPath], { stdio: "inherit" })

child.on("close", (code) => {
  console.log(`Script finalizado com código ${code}`)
})
