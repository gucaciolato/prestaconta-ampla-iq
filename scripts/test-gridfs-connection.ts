import { checkGridFSConnection, uploadFile, listFiles, getFileById, deleteFileById } from "../lib/gridfs-service"

async function testGridFS() {
  try {
    console.log("Testando conexão GridFS...")
    const connectionResult = await checkGridFSConnection()
    console.log("Resultado da conexão:", connectionResult)

    if (!connectionResult.success) {
      console.error("Falha na conexão GridFS. Abortando testes.")
      return
    }

    console.log("\nTestando upload de arquivo...")
    const testContent = "Este é um arquivo de teste para o GridFS " + new Date().toISOString()
    const testBuffer = Buffer.from(testContent)

    const fileId = await uploadFile(testBuffer, "teste.txt", "text/plain")
    console.log("Arquivo enviado com sucesso. ID:", fileId)

    console.log("\nListando arquivos...")
    const files = await listFiles()
    console.log(`${files.length} arquivos encontrados:`)
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.filename} (ID: ${file._id})`)
    })

    console.log("\nBuscando arquivo recém-enviado...")
    const fileData = await getFileById(fileId)
    if (fileData) {
      console.log("Arquivo encontrado:")
      console.log("Conteúdo:", fileData.file.toString())
    } else {
      console.log("Arquivo não encontrado!")
    }

    console.log("\nExcluindo arquivo de teste...")
    const deleteResult = await deleteFileById(fileId)
    console.log("Resultado da exclusão:", deleteResult ? "Sucesso" : "Falha")

    console.log("\nTodos os testes concluídos com sucesso!")
  } catch (error) {
    console.error("Erro durante os testes:", error)
  }
}

testGridFS()
