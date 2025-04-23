import { execSync } from "child_process"
import path from "path"

// Caminho para o script de correção
const scriptPath = path.join(__dirname, "fix-admin-user.ts")

try {
  console.log("Executando correção do usuário admin...")
  execSync(`npx ts-node ${scriptPath}`, { stdio: "inherit" })
} catch (error) {
  console.error("Erro ao executar a correção:", error)
}
