import { exec } from "child_process"

// Executar o script de verificação de coleções
exec("ts-node scripts/check-collections.ts", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`)
    return
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`)
    return
  }
  console.log(`Stdout: ${stdout}`)
})
