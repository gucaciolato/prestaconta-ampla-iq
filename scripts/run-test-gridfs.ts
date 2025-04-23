import { exec } from "child_process"

// Executar o script de teste
exec("ts-node scripts/test-gridfs-connection.ts", (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao executar o script: ${error.message}`)
    return
  }

  if (stderr) {
    console.error(`Erro no script: ${stderr}`)
    return
  }

  console.log(stdout)
})
