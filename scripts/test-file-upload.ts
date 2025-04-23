import fs from "fs"
import path from "path"
import { uploadFile, listFiles, getFileById } from "../lib/gridfs-service"

async function testFileUpload() {
  try {
    console.log("Iniciando teste de upload de arquivo")

    // Listar arquivos existentes
    console.log("\n1. Listando arquivos existentes:")
    const existingFiles = await listFiles()
    console.log(`Encontrados ${existingFiles.length} arquivos no GridFS`)

    // Criar um arquivo de teste
    const testFilePath = path.join(__dirname, "test-upload.txt")
    const testContent = `Este é um arquivo de teste criado em ${new Date().toISOString()}`
    fs.writeFileSync(testFilePath, testContent)
    console.log(`\n2. Arquivo de teste criado: ${testFilePath}`)

    // Ler o arquivo como buffer
    const fileBuffer = fs.readFileSync(testFilePath)
    console.log(`Arquivo lido como buffer: ${fileBuffer.length} bytes`)

    // Fazer upload do arquivo
    console.log("\n3. Fazendo upload do arquivo para o GridFS")
    const fileId = await uploadFile(fileBuffer, "test-upload.txt", "text/plain")
    console.log(`Upload concluído com sucesso. FileID: ${fileId}`)

    // Buscar o arquivo
    console.log("\n4. Buscando o arquivo enviado")
    const fileResult = await getFileById(fileId)

    if (fileResult) {
      console.log(`Arquivo recuperado com sucesso: ${fileResult.file.length} bytes`)
      console.log(`Conteúdo do arquivo: ${fileResult.file.toString("utf8")}`)
    } else {
      console.error("Arquivo não encontrado após o upload!")
    }

    // Listar arquivos novamente
    console.log("\n5. Listando arquivos após o upload:")
    const updatedFiles = await listFiles()
    console.log(`Agora existem ${updatedFiles.length} arquivos no GridFS`)

    // Limpar arquivo de teste
    fs.unlinkSync(testFilePath)
    console.log("\n6. Arquivo de teste local removido")

    console.log("\nTeste de upload concluído com sucesso!")
  } catch (error) {
    console.error("ERRO NO TESTE DE UPLOAD:", error)
  }
}

testFileUpload()
