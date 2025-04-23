"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { HourglassIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

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

export default function FinanceiroPage() {
  const [anoFiltro, setAnoFiltro] = useState<string>("todos")
  const [mesFiltro, setMesFiltro] = useState<string>("todos")
  const [busca, setBusca] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("receitas")
  const [items, setItems] = useState<FinanceiroItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const anos = ["2024", "2023", "2022"]
  const meses = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ]

  useEffect(() => {
    fetchFinanceiro()
  }, [anoFiltro, mesFiltro, activeTab])

  async function fetchFinanceiro() {
    try {
      setIsLoading(true)

      let url = "/api/financeiro?tipo=" + (activeTab === "receitas" ? "receita" : "despesa")

      if (anoFiltro !== "todos") {
        url += `&ano=${anoFiltro}`
      }

      if (mesFiltro !== "todos") {
        url += `&mes=${mesFiltro}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Falha ao carregar dados financeiros")
      }

      const data = await response.json()
      setItems(data)
    } catch (err) {
      setError("Não foi possível carregar os dados financeiros. Tente novamente mais tarde.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredItems = items.filter((item) => {
    return (
      busca === "" ||
      item.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (item.fonte && item.fonte.toLowerCase().includes(busca.toLowerCase())) ||
      (item.categoria && item.categoria.toLowerCase().includes(busca.toLowerCase()))
    )
  })

  const totalValue = filteredItems.reduce((acc, item) => acc + item.valor, 0)

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Financeiro</h1>
          <Tabs defaultValue="receitas">
            <TabsList>
              <TabsTrigger value="receitas">Receitas</TabsTrigger>
              <TabsTrigger value="despesas">Despesas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 border-b">Data</th>
                    <th className="text-left p-3 border-b">Descrição</th>
                    <th className="text-left p-3 border-b">Fonte</th>
                    <th className="text-right p-3 border-b">Valor (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3">
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-6 w-32" />
                      </td>
                      <td className="p-3 text-right">
                        <Skeleton className="h-6 w-24 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="receitas" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Financeiro</h1>
          <TabsList>
            <TabsTrigger value="receitas">Receitas</TabsTrigger>
            <TabsTrigger value="despesas">Despesas</TabsTrigger>
          </TabsList>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Filtrar por ano:</label>
                <Select value={anoFiltro} onValueChange={setAnoFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {anos.map((ano) => (
                      <SelectItem key={ano} value={ano}>
                        {ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Mês:</label>
                <Select value={mesFiltro} onValueChange={setMesFiltro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {meses.map((mes) => (
                      <SelectItem key={mes.value} value={mes.value}>
                        {mes.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 md:flex-[2]">
                <label className="text-sm font-medium mb-1 block">
                  Buscar {activeTab === "receitas" ? "receitas" : "despesas"}:
                </label>
                <Input
                  type="text"
                  placeholder={`Buscar ${activeTab === "receitas" ? "receitas" : "despesas"}...`}
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={fetchFinanceiro} className="mt-2">
                  Tentar novamente
                </Button>
              </div>
            )}

            <TabsContent value="receitas">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 border-b">Data</th>
                      <th className="text-left p-3 border-b">Descrição</th>
                      <th className="text-left p-3 border-b">Fonte</th>
                      <th className="text-right p-3 border-b">Valor (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <tr key={item._id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{new Date(item.data).toLocaleDateString("pt-BR")}</td>
                          <td className="p-3">{item.descricao}</td>
                          <td className="p-3">{item.fonte}</td>
                          <td className="p-3 text-right">{formatCurrency(item.valor)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <HourglassIcon className="h-12 w-12 mb-4 text-primary/50" />
                            <h3 className="text-xl font-medium mb-2">Em breve</h3>
                            <p>As receitas serão exibidas aqui em breve.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={3} className="p-3 text-right">
                        Total:
                      </td>
                      <td className="p-3 text-right">{formatCurrency(totalValue)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="despesas">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 border-b">Data</th>
                      <th className="text-left p-3 border-b">Descrição</th>
                      <th className="text-left p-3 border-b">Categoria</th>
                      <th className="text-right p-3 border-b">Valor (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <tr key={item._id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{new Date(item.data).toLocaleDateString("pt-BR")}</td>
                          <td className="p-3">{item.descricao}</td>
                          <td className="p-3">{item.categoria}</td>
                          <td className="p-3 text-right">{formatCurrency(item.valor)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <HourglassIcon className="h-12 w-12 mb-4 text-primary/50" />
                            <h3 className="text-xl font-medium mb-2">Em breve</h3>
                            <p>As despesas serão exibidas aqui em breve.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={3} className="p-3 text-right">
                        Total:
                      </td>
                      <td className="p-3 text-right">{formatCurrency(totalValue)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
