"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Download, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Documento {
  _id: string
  titulo: string
  tipo: string
  ano: string
  url: string
}

export default function LivrosContabeisPage() {
  const [anoFiltro, setAnoFiltro] = useState<string>("todos")
  const [busca, setBusca] = useState<string>("")
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Gerar lista de anos (últimos 10 anos)
  const anoAtual = new Date().getFullYear()
  const anos = Array.from({ length: 10 }, (_, i) => (anoAtual - i).toString())
  const [mostrarInputAno, setMostrarInputAno] = useState(false)
  const [anoPersonalizado, setAnoPersonalizado] = useState("")

  useEffect(() => {
    fetchDocumentos()
  }, [anoFiltro, anoPersonalizado])

  async function fetchDocumentos() {
    try {
      setIsLoading(true)

      let url = "/api/documentos?tipo=livro"

      if (anoFiltro !== "todos") {
        if (anoFiltro === "outro") {
          if (anoPersonalizado) {
            url += `&ano=${anoPersonalizado}`
          }
        } else {
          url += `&ano=${anoFiltro}`
        }
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Falha ao carregar documentos")
      }

      const data = await response.json()
      setDocumentos(data)
    } catch (err) {
      setError("Não foi possível carregar os documentos. Tente novamente mais tarde.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDocs = documentos.filter((doc) => {
    const matchesBusca = busca === "" || doc.titulo.toLowerCase().includes(busca.toLowerCase())
    return matchesBusca
  })

  const handleOpenModal = (doc: Documento) => {
    setSelectedDoc(doc)
    setModalOpen(true)
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Livros Contábeis</h1>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full md:flex-[3]" />
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
      <h1 className="text-3xl font-bold text-primary mb-8">Livros Contábeis</h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {!mostrarInputAno ? (
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Filtrar por ano:</label>
                <Select
                  value={anoFiltro}
                  onValueChange={(value) => {
                    setAnoFiltro(value)
                    if (value === "outro") {
                      setMostrarInputAno(true)
                    }
                  }}
                >
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
                    <SelectItem value="outro">Outro ano...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Filtrar por ano:</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1900"
                    max="2100"
                    placeholder="Digite o ano"
                    value={anoPersonalizado}
                    onChange={(e) => setAnoPersonalizado(e.target.value)}
                    onBlur={() => {
                      if (anoPersonalizado) {
                        fetchDocumentos()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMostrarInputAno(false)
                      setAnoFiltro("todos")
                      setAnoPersonalizado("")
                      fetchDocumentos()
                    }}
                  >
                    Usar lista
                  </Button>
                </div>
              </div>
            )}

            <div className="flex-1 md:flex-[3]">
              <label className="text-sm font-medium mb-1 block">Buscar:</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Buscar livros..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={() => setBusca("")}>
                  Limpar Filtro
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDocumentos} className="mt-2">
            Tentar novamente
          </Button>
        </div>
      )}

      {filteredDocs.length === 0 && !error ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
          <p className="text-gray-500 mb-4">Não há documentos disponíveis com os filtros selecionados.</p>
          <Button
            variant="outline"
            onClick={() => {
              setAnoFiltro("todos")
              setBusca("")
              setMostrarInputAno(false)
              setAnoPersonalizado("")
            }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <Card key={doc._id} className="overflow-hidden">
              <div className="p-6 flex flex-col items-center">
                <FileText className="h-20 w-20 text-primary mb-4" />
                <h3 className="font-semibold text-lg text-center mb-2">{doc.titulo}</h3>
                <p className="text-sm text-gray-500 mb-4">Ano: {doc.ano}</p>

                <div className="flex gap-2 mt-2">
                  <Button variant="secondary" onClick={() => handleOpenModal(doc)}>
                    <Eye className="mr-2 h-4 w-4" /> Ver documento
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
              {selectedDoc?.titulo} - {selectedDoc?.ano}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <iframe src={selectedDoc?.url} className="w-full h-[70vh]" title={selectedDoc?.titulo} />
            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                selectedDoc &&
                handleDownload(selectedDoc.url, `${selectedDoc.titulo.replace(/\s+/g, "-")}-${selectedDoc.ano}.pdf`)
              }
            >
              <Download className="mr-2 h-4 w-4" /> Baixar Documento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
