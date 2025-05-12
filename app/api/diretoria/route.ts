import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/postgres-service"

export async function GET() {
  try {
    // Buscar a diretoria
    const diretoriaResult = await query("SELECT * FROM diretoria LIMIT 1")

    if (diretoriaResult.rowCount === 0) {
      return NextResponse.json({})
    }

    const diretoria = diretoriaResult.rows[0]

    // Buscar os membros da diretoria
    const membrosResult = await query("SELECT * FROM diretoria_membros WHERE diretoria_id = $1", [diretoria.id])

    // Organizar os membros por tipo
    const diretoriaExecutiva = []
    const conselhoFiscal = []
    const suplentesConselhoFiscal = []

    for (const membro of membrosResult.rows) {
      if (membro.tipo === "diretoria") {
        diretoriaExecutiva.push({
          cargo: membro.cargo,
          nome: membro.nome,
        })
      } else if (membro.tipo === "conselho") {
        conselhoFiscal.push({
          cargo: membro.cargo,
          nome: membro.nome,
        })
      } else if (membro.tipo === "suplente") {
        suplentesConselhoFiscal.push({
          cargo: membro.cargo,
          nome: membro.nome,
        })
      }
    }

    return NextResponse.json({
      _id: diretoria.id,
      mandato: diretoria.mandato,
      diretoriaExecutiva,
      conselhoFiscal,
      suplentesConselhoFiscal,
    })
  } catch (error) {
    console.error("Error fetching diretoria:", error)
    return NextResponse.json({ error: "Failed to fetch diretoria" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const client = await query("BEGIN")

    try {
      // Verificar se já existe uma diretoria
      const diretoriaResult = await query("SELECT * FROM diretoria LIMIT 1")
      let diretoriaId

      if (diretoriaResult.rowCount === 0) {
        // Criar nova diretoria
        const newDiretoriaResult = await query("INSERT INTO diretoria (mandato) VALUES ($1) RETURNING id", [
          data.mandato,
        ])
        diretoriaId = newDiretoriaResult.rows[0].id
      } else {
        // Atualizar diretoria existente
        diretoriaId = diretoriaResult.rows[0].id
        await query("UPDATE diretoria SET mandato = $1 WHERE id = $2", [data.mandato, diretoriaId])

        // Remover membros existentes
        await query("DELETE FROM diretoria_membros WHERE diretoria_id = $1", [diretoriaId])
      }

      // Inserir membros da diretoria executiva
      for (const membro of data.diretoriaExecutiva) {
        await query("INSERT INTO diretoria_membros (diretoria_id, nome, cargo, tipo) VALUES ($1, $2, $3, $4)", [
          diretoriaId,
          membro.nome,
          membro.cargo,
          "diretoria",
        ])
      }

      // Inserir membros do conselho fiscal
      for (const membro of data.conselhoFiscal) {
        await query("INSERT INTO diretoria_membros (diretoria_id, nome, cargo, tipo) VALUES ($1, $2, $3, $4)", [
          diretoriaId,
          membro.nome,
          membro.cargo,
          "conselho",
        ])
      }

      // Inserir suplentes do conselho fiscal
      for (const membro of data.suplentesConselhoFiscal) {
        await query("INSERT INTO diretoria_membros (diretoria_id, nome, cargo, tipo) VALUES ($1, $2, $3, $4)", [
          diretoriaId,
          membro.nome,
          membro.cargo,
          "suplente",
        ])
      }

      await query("COMMIT")
      return NextResponse.json({ success: true })
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error updating diretoria:", error)
    return NextResponse.json({ error: "Failed to update diretoria" }, { status: 500 })
  }
}
