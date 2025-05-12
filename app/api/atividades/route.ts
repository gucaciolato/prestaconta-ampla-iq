import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/postgres-service"
import { getUserFromRequest } from "@/lib/auth-service"
import { hasPermission } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    console.log("[ATIVIDADES] Iniciando busca de atividades")

    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 0

    let queryText = "SELECT * FROM atividades"
    const queryParams = []

    queryText += " ORDER BY data_atividade DESC"

    if (limit > 0) {
      queryText += " LIMIT $1"
      queryParams.push(limit)
    }

    console.log("[ATIVIDADES] Executando consulta:", queryText, queryParams)
    const atividadesResult = await query(queryText, queryParams)

    // Buscar fotos para cada atividade
    const atividades = []

    for (const atividade of atividadesResult.rows) {
      // Converter para o formato esperado
      const atividadeFormatada = {
        _id: atividade.id.toString(),
        titulo: atividade.titulo,
        descricao: atividade.descricao,
        dataAtividade: atividade.data_atividade.toISOString(),
        local: atividade.local,
        dataCadastro: atividade.data_cadastro.toISOString(),
        fotos: [],
      }

      // Buscar fotos da atividade
      const fotosResult = await query("SELECT * FROM atividades_fotos WHERE atividade_id = $1", [atividade.id])

      // Processar fotos para incluir URLs completas
      atividadeFormatada.fotos = fotosResult.rows.map((foto) => ({
        fileId: foto.file_id,
        nome: foto.nome,
        tipo: foto.tipo,
        url: foto.file_id ? `/api/files/${foto.file_id}` : foto.url,
      }))

      atividades.push(atividadeFormatada)
    }

    console.log(`[ATIVIDADES] Encontradas ${atividades.length} atividades`)
    return NextResponse.json(atividades)
  } catch (error) {
    console.error("[ATIVIDADES] Erro ao buscar atividades:", error)
    return NextResponse.json({ error: "Erro ao buscar atividades" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[ATIVIDADES] Iniciando criação de atividade")

    // Verificar autenticação e permissão
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!hasPermission(user.role, "atividades")) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const data = await request.json()

    // Validar dados
    if (!data.titulo || !data.descricao || !data.dataAtividade) {
      console.log("[ATIVIDADES] Dados incompletos:", data)
      return NextResponse.json(
        { error: "Dados incompletos. Título, descrição e data da atividade são obrigatórios." },
        { status: 400 },
      )
    }

    // Iniciar transação
    await query("BEGIN")

    try {
      // Inserir atividade
      const atividadeResult = await query(
        `INSERT INTO atividades (titulo, descricao, data_atividade, local, data_cadastro)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [data.titulo, data.descricao, new Date(data.dataAtividade), data.local || "", new Date()],
      )

      const atividadeId = atividadeResult.rows[0].id

      // Inserir fotos se existirem
      if (data.fotos && Array.isArray(data.fotos) && data.fotos.length > 0) {
        for (const foto of data.fotos) {
          await query(
            `INSERT INTO atividades_fotos (atividade_id, file_id, nome, tipo, url)
             VALUES ($1, $2, $3, $4, $5)`,
            [atividadeId, foto.fileId || null, foto.nome || null, foto.tipo || null, foto.url || null],
          )
        }
      }

      await query("COMMIT")

      console.log(`[ATIVIDADES] Atividade criada com ID: ${atividadeId}`)

      return NextResponse.json({
        _id: atividadeId.toString(),
        titulo: data.titulo,
        descricao: data.descricao,
        dataAtividade: new Date(data.dataAtividade).toISOString(),
        local: data.local || "",
        fotos: data.fotos || [],
        dataCadastro: new Date().toISOString(),
      })
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("[ATIVIDADES] Erro ao criar atividade:", error)
    return NextResponse.json({ error: "Erro ao criar atividade" }, { status: 500 })
  }
}
