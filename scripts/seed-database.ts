import { MongoClient } from "mongodb"
import dotenv from "dotenv"

// Carregar variáveis de ambiente
dotenv.config()

const uri = process.env.MONGODB_URI || ""
const dbName = process.env.MONGODB_DB || "prestaconta"

async function seedDatabase() {
  if (!uri) {
    console.error("MONGODB_URI não está definido nas variáveis de ambiente")
    process.exit(1)
  }

  console.log("Iniciando alimentação do banco de dados...")
  console.log(`URI: ${uri}`)
  console.log(`Database: ${dbName}`)

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Conectado ao MongoDB")

    const db = client.db(dbName)

    // Alimentar a coleção de avisos
    console.log("Alimentando a coleção de avisos...")
    await seedAvisos(db)

    // Alimentar a coleção de atividades
    console.log("Alimentando a coleção de atividades...")
    await seedAtividades(db)

    // Alimentar a coleção de financeiro
    console.log("Alimentando a coleção de financeiro...")
    await seedFinanceiro(db)

    // Alimentar a coleção de diretoria
    console.log("Alimentando a coleção de diretoria...")
    await seedDiretoria(db)

    console.log("Alimentação do banco de dados concluída com sucesso!")
  } catch (error) {
    console.error("Erro ao alimentar banco de dados:", error)
  } finally {
    await client.close()
    console.log("Conexão com o MongoDB fechada")
  }
}

async function seedAvisos(db: any) {
  const avisos = [
    {
      titulo: "Assembleia Geral",
      conteudo:
        "Convocamos todos os moradores para a Assembleia Geral que será realizada no dia 15/05/2023 às 19h no salão de festas.",
      autor: "Síndico",
      dataPublicacao: new Date("2023-05-01"),
      ativo: true,
    },
    {
      titulo: "Manutenção da Piscina",
      conteudo: "Informamos que a piscina ficará fechada para manutenção nos dias 10/05/2023 a 12/05/2023.",
      autor: "Administração",
      dataPublicacao: new Date("2023-05-05"),
      ativo: true,
    },
    {
      titulo: "Novo Sistema de Segurança",
      conteudo: "Informamos que o novo sistema de segurança será instalado a partir do dia 20/05/2023.",
      autor: "Síndico",
      dataPublicacao: new Date("2023-05-10"),
      ativo: true,
    },
  ]

  const result = await db.collection("avisos").insertMany(avisos)
  console.log(`${result.insertedCount} avisos inseridos`)
}

async function seedAtividades(db: any) {
  const atividades = [
    {
      titulo: "Manutenção do Elevador",
      descricao: "Manutenção preventiva do elevador do bloco A",
      responsavel: "Empresa XYZ",
      dataInicio: new Date("2023-05-15"),
      dataFim: new Date("2023-05-15"),
      status: "Concluído",
    },
    {
      titulo: "Limpeza da Caixa d'água",
      descricao: "Limpeza e higienização da caixa d'água do condomínio",
      responsavel: "Empresa ABC",
      dataInicio: new Date("2023-06-10"),
      dataFim: new Date("2023-06-10"),
      status: "Agendado",
    },
    {
      titulo: "Pintura da Fachada",
      descricao: "Pintura da fachada do condomínio",
      responsavel: "Empresa DEF",
      dataInicio: new Date("2023-07-01"),
      dataFim: new Date("2023-07-15"),
      status: "Agendado",
    },
  ]

  const result = await db.collection("atividades").insertMany(atividades)
  console.log(`${result.insertedCount} atividades inseridas`)
}

async function seedFinanceiro(db: any) {
  const financeiro = [
    {
      tipo: "Receita",
      descricao: "Taxa de Condomínio - Maio/2023",
      valor: 15000,
      data: new Date("2023-05-10"),
      categoria: "Taxa de Condomínio",
    },
    {
      tipo: "Despesa",
      descricao: "Conta de Água - Maio/2023",
      valor: 3500,
      data: new Date("2023-05-15"),
      categoria: "Água",
    },
    {
      tipo: "Despesa",
      descricao: "Conta de Energia - Maio/2023",
      valor: 2800,
      data: new Date("2023-05-20"),
      categoria: "Energia",
    },
    {
      tipo: "Receita",
      descricao: "Aluguel do Salão de Festas",
      valor: 500,
      data: new Date("2023-05-25"),
      categoria: "Aluguel",
    },
  ]

  const result = await db.collection("financeiro").insertMany(financeiro)
  console.log(`${result.insertedCount} registros financeiros inseridos`)
}

async function seedDiretoria(db: any) {
  const diretoria = [
    {
      nome: "João Silva",
      cargo: "Síndico",
      email: "joao.silva@exemplo.com",
      telefone: "(11) 99999-9999",
      mandatoInicio: new Date("2023-01-01"),
      mandatoFim: new Date("2024-12-31"),
      foto: null,
    },
    {
      nome: "Maria Oliveira",
      cargo: "Subsíndico",
      email: "maria.oliveira@exemplo.com",
      telefone: "(11) 88888-8888",
      mandatoInicio: new Date("2023-01-01"),
      mandatoFim: new Date("2024-12-31"),
      foto: null,
    },
    {
      nome: "Pedro Santos",
      cargo: "Conselheiro",
      email: "pedro.santos@exemplo.com",
      telefone: "(11) 77777-7777",
      mandatoInicio: new Date("2023-01-01"),
      mandatoFim: new Date("2024-12-31"),
      foto: null,
    },
  ]

  const result = await db.collection("diretoria").insertMany(diretoria)
  console.log(`${result.insertedCount} membros da diretoria inseridos`)
}

// Executar a função
seedDatabase()
