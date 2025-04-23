import dotenv from "dotenv"

// Carregar variáveis de ambiente
dotenv.config()

console.log("Verificando variáveis de ambiente...")

const requiredVars = ["MONGODB_URI", "MONGODB_DB", "NEXT_PUBLIC_USUARIO_LOGIN", "NEXT_PUBLIC_SENHA_LOGIN", "JWT_SECRET"]

let missingVars = false

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`Variável de ambiente ${varName} não está definida`)
    missingVars = true
  } else {
    // Mostrar apenas os primeiros caracteres para variáveis sensíveis
    const value =
      varName.includes("SECRET") || varName.includes("SENHA")
        ? `${process.env[varName]?.substring(0, 3)}...`
        : process.env[varName]

    console.log(`${varName}: ${value}`)
  }
}

if (missingVars) {
  console.error("Algumas variáveis de ambiente obrigatórias estão faltando")
  process.exit(1)
} else {
  console.log("Todas as variáveis de ambiente obrigatórias estão definidas")
}
