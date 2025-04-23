import { exec } from "child_process"

// Executar o script de teste de upload
exec("ts-node scripts/test-file-upload.ts", (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao executar o teste: ${error.message}`)
    return
  }

  if (stderr) {
    console.error(`Erro no teste: ${stderr}`)
    return
  }

  console.log(stdout)
})
