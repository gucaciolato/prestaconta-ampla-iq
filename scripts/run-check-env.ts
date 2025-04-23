import { exec } from "child_process"

// Executar o script check-env.ts
console.log("Executando script para verificar variáveis de ambiente...")

exec("npx ts-node scripts/check-env.ts", (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao executar o script: ${error.message}`)
    return
  }

  if (stderr) {
    console.error(`Erro no script: ${stderr}`)
    return
  }

  console.log(`Saída do script:\n${stdout}`)
})
