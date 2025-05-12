"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Download, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { ensureValidFileUrl } from "@/lib/file-utils"

interface Relatorio {
  _id: string
  titulo: string
  tipo: string
  ano: string
  mes: string
  url: string
}

export default function RelatoriosPage() {
  const [anoFiltro, setAnoFiltro] = useState<string>("todos")
  const [mesFiltro, setMesFiltro] = useState<string>("todos")
  const [busca, setBusca] = useState<string>("")
  const [selectedReport, setSelectedReport] = useState<Relatorio | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [anoCustom, setAnoCustom] = useState<string>("")

  // Gerar lista de anos (ano atual até 10 anos atrás)
  const anoAtual = new Date().getFullYear()
  const anos = Array.from({ length: 10 }, (_, i) => (anoAtual - i).toString())

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
    fetchRelatorios()
  }, [anoFiltro, mesFiltro])

  async function fetchRelatorios() {
    try {
      setIsLoading(true)

      let url = "/api/documentos?tipo=relatorio"
      const params = new URLSearchParams()

      if (anoFiltro !== "todos") {
        params.append("ano", anoFiltro)
      }

      if (mesFiltro !== "todos") {
        params.append("mes", mesFiltro)
      }

      if (params.toString()) {
        url += `&${params.toString()}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Falha ao carregar relatórios")
      }

      const data = await response.json()
      setRelatorios(data)
    } catch (err) {
      setError("Não foi possível carregar os relatórios. Tente novamente mais tarde.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnoChange = (value: string) => {
    if (value === "custom") {
      // Não faz nada aqui, apenas marca que queremos usar um ano personalizado
    } else {
      setAnoFiltro(value)
      setAnoCustom("")
    }
  }

  const handleAnoCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAnoCustom(value)

    // Se o valor for um número válido de 4 dígitos, atualiza o filtro
    if (/^\d{4}$/.test(value)) {
      setAnoFiltro(value)
    } else if (value === "") {
      setAnoFiltro("todos")
    }
  }

  const filteredReports = relatorios.filter((report) => {
    const matchesBusca = busca === "" || report.titulo.toLowerCase().includes(busca.toLowerCase())
    return matchesBusca
  })

  const handleOpenModal = (report: Relatorio) => {
    setSelectedReport(report)
    setModalOpen(true)
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      console.log(`Iniciando download do arquivo: ${url}, nome: ${filename}`)

      // Garantir que a URL seja válida
      const fileUrl = ensureValidFileUrl(url)
      console.log(`URL processada para download: ${fileUrl}`)

      // Método 1: Usando fetch para obter o arquivo e depois criar um blob
      const response = await fetch(fileUrl)

      if (!response.ok) {
        throw new Error(`Erro ao baixar arquivo: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      // Criar link de download e simular clique
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()

      // Limpar após o download
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }, 100)

      toast({
        title: "Download iniciado",
        description: `O arquivo "${filename}" está sendo baixado.`,
      })
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error)
      toast({
        title: "Erro ao baixar arquivo",
        description: error instanceof Error ? error.message : "Não foi possível baixar o arquivo.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Relatórios de Atividade</h1>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-6 flex flex-col items-center">
                <Skeleton className="h-20 w-20 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Relatórios de Atividade</h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Filtrar por ano:</label>
              <div className="flex gap-2">
                <Select value={anoCustom ? "custom" : anoFiltro} onValueChange={handleAnoChange}>
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
                    <SelectItem value="custom">Outro ano...</SelectItem>
                  </SelectContent>
                </Select>
                {anoFiltro === "custom" || anoCustom ? (
                  <Input
                    type="number"
                    placeholder="Digite o ano"
                    value={anoCustom}
                    onChange={handleAnoCustomChange}
                    className="w-32"
                    min="1900"
                    max="2100"
                  />
                ) : null}
              </div>
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
              <label className="text-sm font-medium mb-1 block">Buscar:</label>
              <Input
                type="text"
                placeholder="Buscar relatórios..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchRelatorios} className="mt-2">
            Tentar novamente
          </Button>
        </div>
      )}

      {filteredReports.length === 0 && !error ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum relatório encontrado</h3>
          <p className="text-gray-500 mb-4">Não há relatórios disponíveis com os filtros selecionados.</p>
          <Button
            variant="outline"
            onClick={() => {
              setAnoFiltro("todos")
              setMesFiltro("todos")
              setBusca("")
              setAnoCustom("")
            }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report._id} className="overflow-hidden">
              <div className="p-6 flex flex-col items-center">
                <FileText className="h-20 w-20 text-red-500 mb-4" />
                <h3 className="font-semibold text-lg text-center mb-2">{report.titulo}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {meses.find((m) => m.value === report.mes)?.label || ""} / {report.ano}
                </p>

                <div className="flex gap-2 mt-2">
                  <Button variant="secondary" onClick={() => handleOpenModal(report)}>
                    <Eye className="mr-2 h-4 w-4" /> Ver relatório
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReport?.titulo} - {meses.find((m) => m.value === selectedReport?.mes)?.label || ""} /{" "}
              {selectedReport?.ano}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            {selectedReport && (
              <>
                <iframe
                  src={selectedReport ? ensureValidFileUrl(selectedReport.url) : ""}
                  className="w-full h-[70vh]"
                  title={selectedReport?.titulo}
                  onError={(e) => {
                    console.error("Erro ao carregar iframe:", e)
                    toast({
                      title: "Erro ao carregar documento",
                      description: `Não foi possível carregar o documento. URL: ${selectedReport?.url}`,
                      variant: "destructive",
                    })
                  }}
                />
                <div className="text-xs text-gray-500 mt-2 text-center">URL do documento: {selectedReport.url}</div>
              </>
            )}
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                if (selectedReport) {
                  const fileUrl = ensureValidFileUrl(selectedReport.url)
                  const fileName = `${selectedReport.titulo.replace(/\s+/g, "-")}-${selectedReport.ano}-${selectedReport.mes}.pdf`
                  console.log(`Preparando download: URL=${fileUrl}, Nome=${fileName}`)
                  handleDownload(fileUrl, fileName)
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Baixar Relatório
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
