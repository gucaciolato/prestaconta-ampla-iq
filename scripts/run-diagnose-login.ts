import { execSync } from "child_process"
import path from "path"

// Caminho para o script de diagnóstico
const scriptPath = path.join(__dirname, "diagnose-login.ts")

try {
  console.log("Executando diagnóstico do sistema de login...")
  execSync(`npx ts-node ${scriptPath}`, { stdio: "inherit" })
} catch (error) {
  console.error("Erro ao executar o diagnóstico:", error)
}
