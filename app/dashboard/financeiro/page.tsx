"use client"

import { useAuth } from "@/lib/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { FinanceiroContent } from "./financeiro-content" // Componente com o conteúdo atual da página

interface FinanceiroItem {
  _id: string
  tipo: "receita" | "despesa"
  data: string
  descricao: string
  fonte?: string
  categoria?: string
  valor: number
  ano: string
  mes: string
}

export default function FinanceiroDashboardPage() {
  const { hasPermission } = useAuth()

  // Verificar permissão
  if (!hasPermission("financeiro")) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </CardContent>
      </Card>
    )
  }

  // Se tem permissão, renderiza o conteúdo normal
  return <FinanceiroContent />
}
