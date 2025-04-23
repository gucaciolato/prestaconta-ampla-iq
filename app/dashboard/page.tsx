"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-provider"
import { CalendarDays, DollarSign, FileText, ImageIcon, Megaphone, Users } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  avisos: number
  financeiro: {
    receitas: number
    despesas: number
    saldo: number
  }
  galeria: number
  documentos: number
  relatorios: number
  diretoria: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [atividades, setAtividades] = useState<any[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Buscar estatísticas de avisos
        const avisosRes = await fetch("/api/avisos")
        const avisosData = await avisosRes.json()

        // Buscar estatísticas financeiras
        const financeiroRes = await fetch("/api/financeiro")
        const financeiroData = await financeiroRes.json()

        // Calcular saldo
        const receitas = financeiroData
          .filter((item: any) => item.tipo === "receita")
          .reduce((acc: number, item: any) => acc + (Number.parseFloat(item.valor) || 0), 0)

        const despesas = financeiroData
          .filter((item: any) => item.tipo === "despesa")
          .reduce((acc: number, item: any) => acc + (Number.parseFloat(item.valor) || 0), 0)

        // Buscar estatísticas da galeria
        const galeriaRes = await fetch("/api/galeria")
        const galeriaData = await galeriaRes.json()

        // Buscar estatísticas de documentos
        const documentosRes = await fetch("/api/documentos")
        const documentosData = await documentosRes.json()

        // Buscar estatísticas de relatórios
        const relatoriosRes = await fetch("/api/documentos?tipo=relatorio")
        const relatoriosData = await relatoriosRes.json()

        // Buscar estatísticas da diretoria
        const diretoriaRes = await fetch("/api/diretoria")
        const diretoriaData = await diretoriaRes.json()

        // Buscar atividades recentes
        try {
          const atividadesRes = await fetch("/api/atividades?limit=5")
          if (atividadesRes.ok) {
            const atividadesData = await atividadesRes.json()
            setAtividades(atividadesData)
          }
        } catch (err) {
          console.log("API de atividades ainda não disponível")
        }

        // Corrigir a contagem de membros da diretoria
        let membroCount = 0
        if (diretoriaData && Array.isArray(diretoriaData.membros)) {
          membroCount = diretoriaData.membros.length
        } else if (Array.isArray(diretoriaData)) {
          membroCount = diretoriaData.length
        }

        setStats({
          avisos: avisosData.length || 0,
          financeiro: {
            receitas: receitas,
            despesas: despesas,
            saldo: receitas - despesas,
          },
          galeria: galeriaData.length || 0,
          documentos: documentosData.length || 0,
          relatorios: relatoriosData.length || 0,
          diretoria: membroCount,
        })
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err)
        setError("Não foi possível carregar as estatísticas. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatarData = (data: string) => {
    const date = new Date(data)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo(a), {user?.username}! Gerencie o conteúdo do portal PrestaConta.
          </p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">{error}</div>}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Estatísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/mural-de-avisos">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mural de Avisos</CardTitle>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats?.avisos || 0}</div>
                      <p className="text-xs text-muted-foreground">Avisos publicados</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/financeiro">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receitas e Despesas</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        R${" "}
                        {stats?.financeiro.saldo.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || "0,00"}
                      </div>
                      <p className="text-xs text-muted-foreground">Saldo atual</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/galeria">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Galeria de Fotos</CardTitle>
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats?.galeria || 0}</div>
                      <p className="text-xs text-muted-foreground">Imagens publicadas</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/livros-contabeis">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Livros Contábeis</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats?.documentos || 0}</div>
                      <p className="text-xs text-muted-foreground">Documentos publicados</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/relatorios">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats?.relatorios || 0}</div>
                      <p className="text-xs text-muted-foreground">Relatórios publicados</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/diretoria">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Diretoria</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats?.diretoria || 0}</div>
                      <p className="text-xs text-muted-foreground">Membros cadastrados</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : atividades.length > 0 ? (
                  <div className="space-y-4">
                    {atividades.map((atividade) => (
                      <div key={atividade._id} className="flex items-start space-x-4 border-b pb-4">
                        <div className="flex-1">
                          <h3 className="font-medium">{atividade.titulo}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{atividade.descricao}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatarData(atividade.dataAtividade)}</p>
                        </div>
                      </div>
                    ))}
                    <Link href="/dashboard/atividades" className="text-sm text-blue-600 hover:underline">
                      Ver todas as atividades
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma atividade recente registrada.</p>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Informações</CardTitle>
                <CardDescription>Dados da organização</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Nome</p>
                      <p className="text-sm text-muted-foreground">Associação de Assistência ao Menor de Platina</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sigla</p>
                      <p className="text-sm text-muted-foreground">AMPLA</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">CNPJ</p>
                      <p className="text-sm text-muted-foreground">49.892.987/0001-95</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">(18) 3354-1181</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>Visualizações e interações com o portal</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Estatísticas não disponíveis no momento.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
