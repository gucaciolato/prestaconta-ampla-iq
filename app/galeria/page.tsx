"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RefreshCw, Loader2, Download, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

interface Foto {
  _id: string
  titulo: string
  descricao: string
  data: string
  url: string
  ano: string
  mes: string
}

export default function GaleriaPage() {
  const [anoFiltro, setAnoFiltro] = useState<string>("todos")
  const [mesFiltro, setMesFiltro] = useState<string>("todos")
  const [busca, setBusca] = useState<string>("")
  const [selectedImage, setSelectedImage] = useState<Foto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [fotos, setFotos] = useState<Foto[]>([])
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
    fetchFotos()
  }, [anoFiltro, mesFiltro])

  async function fetchFotos() {
    try {
      setIsLoading(true)

      let url = "/api/galeria"
      const params = new URLSearchParams()

      if (anoFiltro !== "todos") {
        params.append("ano", anoFiltro)
      }

      if (mesFiltro !== "todos") {
        params.append("mes", mesFiltro)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Falha ao carregar fotos")
      }

      const data = await response.json()
      setFotos(data)
    } catch (err) {
      setError("Não foi possível carregar as fotos. Tente novamente mais tarde.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredFotos = fotos.filter((foto) => {
    const matchesBusca =
      busca === "" ||
      foto.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      foto.descricao.toLowerCase().includes(busca.toLowerCase())

    return matchesBusca
  })

  const handleOpenModal = (foto: Foto) => {
    setSelectedImage(foto)
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
        <h1 className="text-3xl font-bold text-primary mb-8">Galeria de Fotos</h1>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mb-6">
          <Button variant="outline" disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Carregando...
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="overflow-hidden rounded-lg shadow-md">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 bg-white">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Galeria de Fotos</h1>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={anoFiltro} onValueChange={setAnoFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os anos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os anos</SelectItem>
                  {anos.map((ano) => (
                    <SelectItem key={ano} value={ano}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={mesFiltro} onValueChange={setMesFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os meses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  {meses.map((mes) => (
                    <SelectItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 md:flex-[2]">
              <Input
                type="text"
                placeholder="Buscar fotos..."
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
          <Button variant="outline" size="sm" onClick={fetchFotos} className="mt-2">
            Tentar novamente
          </Button>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <Button variant="outline" className="flex items-center gap-2" onClick={fetchFotos}>
          <RefreshCw className="h-4 w-4" />
          Atualizar Imagens
        </Button>
      </div>

      {filteredFotos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Nenhuma foto encontrada com os filtros selecionados.</p>
          <Button
            variant="outline"
            onClick={() => {
              setAnoFiltro("todos")
              setMesFiltro("todos")
              setBusca("")
            }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFotos.map((foto) => (
            <div
              key={foto._id}
              className="cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 w-full">
                <Image src={foto.url || "/placeholder.svg"} alt={foto.titulo} fill className="object-cover" />
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-lg mb-1">{foto.titulo}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{foto.descricao}</p>
                <Button variant="secondary" size="sm" onClick={() => handleOpenModal(foto)}>
                  <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedImage?.titulo}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <div className="relative w-full max-h-[70vh] overflow-auto">
              <Image
                src={selectedImage?.url || "/placeholder.svg"}
                alt={selectedImage?.titulo || "Imagem"}
                width={800}
                height={600}
                className="object-contain mx-auto"
              />
            </div>
            <p className="my-4 text-gray-700">{selectedImage?.descricao}</p>
            <Button
              variant="outline"
              onClick={() =>
                selectedImage && handleDownload(selectedImage.url, `${selectedImage.titulo.replace(/\s+/g, "-")}.jpg`)
              }
            >
              <Download className="mr-2 h-4 w-4" /> Baixar Imagem
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
