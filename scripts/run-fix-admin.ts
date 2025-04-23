import { exec } from "child_process"

// Executar o script fix-admin-user.ts
console.log("Executando script para corrigir usuário admin...")

exec("npx ts-node scripts/fix-admin-user.ts", (error, stdout, stderr) => {
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
