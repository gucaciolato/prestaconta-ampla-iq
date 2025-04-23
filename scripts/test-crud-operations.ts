import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "ampla"

async function testCrudOperations() {
  console.log("Iniciando teste de operações CRUD")

  let client: MongoClient | null = null

  try {
    console.log("Conectando ao MongoDB...")
    client = new MongoClient(uri)
    await client.connect()

    const db = client.db(dbName)
    console.log(`Conectado ao banco de dados: ${dbName}`)

    // Collection de teste
    const testCollection = "test_crud"
    const collection = db.collection(testCollection)

    // Teste de inserção
    console.log("\n==== Teste de Inserção ====")
    const insertResult = await collection.insertOne({
      titulo: "Documento de Teste",
      conteudo: "Conteúdo de teste para verificar operações CRUD",
      criadoEm: new Date(),
    })

    console.log("Documento inserido:", insertResult.insertedId.toString())

    // Teste de busca
    console.log("\n==== Teste de Busca ====")
    const findResult = await collection.findOne({ _id: insertResult.insertedId })
    console.log("Documento encontrado:", findResult)

    // Teste de atualização
    console.log("\n==== Teste de Atualização ====")
    const updateResult = await collection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { titulo: "Título Atualizado", atualizado: true } },
    )
    console.log("Documento atualizado:", {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
    })

    // Confirmar atualização
    const updatedDoc = await collection.findOne({ _id: insertResult.insertedId })
    console.log("Documento após atualização:", updatedDoc)

    // Teste de exclusão
    console.log("\n==== Teste de Exclusão ====")
    const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId })
    console.log("Documento excluído:", {
      deletedCount: deleteResult.deletedCount,
    })

    // Confirmar exclusão
    const deletedDoc = await collection.findOne({ _id: insertResult.insertedId })
    console.log("Documento após exclusão:", deletedDoc)

    console.log("\nTestes de CRUD concluídos com sucesso!")
  } catch (error) {
    console.error("Erro durante os testes de CRUD:", error)
  } finally {
    if (client) {
      await client.close()
      console.log("Conexão com o MongoDB fechada")
    }
  }
}

testCrudOperations().catch(console.error)
