"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Eye, MapPin } from "lucide-react"

interface Foto {
  fileId: string
  nome: string
  tipo: string
  url?: string
}

interface Atividade {
  _id: string
  titulo: string
  descricao: string
  dataAtividade: string
  local?: string
  fotos: Foto[]
}

export default function AtividadesPage() {
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(null)
  const [selectedFoto, setSelectedFoto] = useState<Foto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function fetchAtividades() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/atividades")

        if (!response.ok) {
          throw new Error("Falha ao carregar atividades")
        }

        const data = await response.json()
        setAtividades(data)
      } catch (err) {
        setError("Não foi possível carregar as atividades. Tente novamente mais tarde.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAtividades()
  }, [])

  const handleOpenModal = (atividade: Atividade, foto?: Foto) => {
    setSelectedAtividade(atividade)
    setSelectedFoto(foto || null)
    setModalOpen(true)
  }

  const handleDownload = (url?: string, filename?: string) => {
    if (!url) return

    const link = document.createElement("a")
    link.href = url
    link.download = filename || "imagem"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderModalContent = () => {
    if (!selectedAtividade) return null

    if (selectedFoto) {
      // Exibir foto específica
      return (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-h-[70vh] overflow-auto">
            <Image
              src={selectedFoto.url || "/placeholder.svg"}
              alt={selectedFoto.nome || selectedAtividade.titulo}
              width={800}
              height={600}
              className="object-contain mx-auto"
            />
          </div>
          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={() => handleDownload(selectedFoto.url, selectedFoto.nome)}>
              <Download className="mr-2 h-4 w-4" /> Baixar Imagem
            </Button>
            <Button variant="secondary" onClick={() => setSelectedFoto(null)}>
              Ver todas as fotos
            </Button>
          </div>
        </div>
      )
    }

    // Exibir todas as fotos da atividade
    return (
      <div className="py-4">
        <p className="whitespace-pre-wrap mb-6">{selectedAtividade.descricao}</p>

        {selectedAtividade.local && (
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{selectedAtividade.local}</span>
          </div>
        )}

        {selectedAtividade.dataAtividade && (
          <div className="text-sm text-muted-foreground mb-6">
            <strong>Data:</strong> {formatDate(selectedAtividade.dataAtividade)}
          </div>
        )}

        {selectedAtividade.fotos && selectedAtividade.fotos.length > 0 ? (
          <div>
            <h3 className="text-lg font-medium mb-4">Fotos da Atividade</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedAtividade.fotos.map((foto, index) => (
                <div
                  key={foto.fileId || index}
                  className="cursor-pointer border rounded-md overflow-hidden hover:shadow-md transition-shadow"
                  onClick={() => setSelectedFoto(foto)}
                >
                  <Image
                    src={foto.url || "/placeholder.svg"}
                    alt={foto.nome || `Foto ${index + 1}`}
                    width={300}
                    height={200}
                    className="object-cover w-full h-48"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma foto disponível para esta atividade.</p>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Atividades Recentes</h1>
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Atividades Recentes</h1>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Atividades Recentes</h1>

      {atividades.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Nenhuma atividade publicada no momento.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {atividades.map((atividade) => (
            <Card key={atividade._id}>
              <CardHeader>
                <CardTitle className="text-2xl">{atividade.titulo}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="line-clamp-3">{atividade.descricao}</p>

                {atividade.local && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{atividade.local}</span>
                  </div>
                )}

                {atividade.fotos && atividade.fotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                    {atividade.fotos.slice(0, 4).map((foto, index) => (
                      <div
                        key={foto.fileId || index}
                        className="cursor-pointer relative h-24 rounded-md overflow-hidden"
                        onClick={() => handleOpenModal(atividade, foto)}
                      >
                        <Image
                          src={foto.url || "/placeholder.svg"}
                          alt={foto.nome || `Foto ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {index === 3 && atividade.fotos.length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white font-medium">
                            +{atividade.fotos.length - 4}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Data: {formatDate(atividade.dataAtividade)}</p>

                <Button variant="secondary" onClick={() => handleOpenModal(atividade)}>
                  <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedAtividade?.titulo}</DialogTitle>
          </DialogHeader>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
