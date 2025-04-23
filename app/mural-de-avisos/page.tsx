"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Eye, FileText } from "lucide-react"

interface Aviso {
  _id: string
  titulo: string
  conteudo: string
  periodoInscricao?: string
  documentos?: string
  dataPublicacao: string
  destaque: boolean
  imagem?: string
  arquivoId?: string
  arquivoNome?: string
  arquivoTipo?: string
  arquivoUrl?: string
}

export default function MuralDeAvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAviso, setSelectedAviso] = useState<Aviso | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function fetchAvisos() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/avisos")

        if (!response.ok) {
          throw new Error("Falha ao carregar avisos")
        }

        const data = await response.json()
        setAvisos(data)
      } catch (err) {
        setError("Não foi possível carregar os avisos. Tente novamente mais tarde.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvisos()
  }, [])

  const handleOpenModal = (aviso: Aviso) => {
    setSelectedAviso(aviso)
    setModalOpen(true)
  }

  const handleDownload = (url?: string, filename?: string) => {
    if (!url) return

    const link = document.createElement("a")
    link.href = url
    link.download = filename || "documento"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderModalContent = () => {
    if (!selectedAviso) return null

    // Verificar se é uma imagem
    if (selectedAviso.imagem) {
      return (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-h-[70vh] overflow-auto">
            <Image
              src={selectedAviso.imagem || "/placeholder.svg"}
              alt={selectedAviso.titulo}
              width={800}
              height={600}
              className="object-contain mx-auto"
            />
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => handleDownload(selectedAviso.imagem, `${selectedAviso.titulo.replace(/\s+/g, "-")}.jpg`)}
          >
            <Download className="mr-2 h-4 w-4" /> Baixar Imagem
          </Button>
        </div>
      )
    }

    // Verificar se é um PDF ou outro documento
    if (selectedAviso.arquivoUrl) {
      if (selectedAviso.arquivoTipo?.includes("pdf")) {
        return (
          <div className="flex flex-col items-center">
            <iframe src={selectedAviso.arquivoUrl} className="w-full h-[70vh]" title={selectedAviso.titulo} />
            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                handleDownload(selectedAviso.arquivoUrl, `${selectedAviso.titulo.replace(/\s+/g, "-")}.pdf`)
              }
            >
              <Download className="mr-2 h-4 w-4" /> Baixar Documento
            </Button>
          </div>
        )
      } else {
        // Para outros tipos de arquivo, apenas oferecer download
        return (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="mb-6 text-center">Este aviso contém um documento anexo.</p>
            <Button
              onClick={() =>
                handleDownload(selectedAviso.arquivoUrl, `${selectedAviso.titulo.replace(/\s+/g, "-")}.pdf`)
              }
            >
              <Download className="mr-2 h-4 w-4" /> Baixar Documento
            </Button>
          </div>
        )
      }
    }

    // Se não tiver anexo, mostrar apenas o conteúdo
    return (
      <div className="py-4">
        <p className="whitespace-pre-wrap">{selectedAviso.conteudo}</p>

        {selectedAviso.periodoInscricao && (
          <div className="bg-blue-600 text-white p-3 rounded mt-4">
            <p>
              <strong>Período de inscrição:</strong> {selectedAviso.periodoInscricao}
            </p>
          </div>
        )}

        {selectedAviso.documentos && (
          <div className="bg-blue-600 text-white p-3 rounded mt-4">
            <p>
              <strong>Documentos necessários:</strong> {selectedAviso.documentos}
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderFileIcon = (aviso: Aviso) => {
    if (aviso.imagem) {
      return null // Já mostramos a imagem diretamente
    } else if (aviso.arquivoId) {
      return <FileText className="h-4 w-4 text-red-500 ml-2" />
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Mural de Avisos</h1>
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
        <h1 className="text-3xl font-bold text-primary mb-8">Mural de Avisos</h1>
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
      <h1 className="text-3xl font-bold text-primary mb-8">Mural de Avisos</h1>

      {avisos.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Nenhum aviso publicado no momento.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {avisos.map((aviso) => (
            <Card key={aviso._id} className={aviso.destaque ? "border-2 border-primary" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <CardTitle className="text-2xl">{aviso.titulo}</CardTitle>
                    {renderFileIcon(aviso)}
                  </div>
                  {aviso.destaque && <Badge className="bg-primary hover:bg-primary">Destaque</Badge>}
                </div>
              </CardHeader>

              {aviso.imagem && (
                <div className="px-6">
                  <Image
                    src={aviso.imagem || "/placeholder.svg"}
                    alt={`Imagem do aviso ${aviso.titulo}`}
                    width={300}
                    height={200}
                    className="rounded-md mb-4"
                  />
                </div>
              )}

              <CardContent className="space-y-4">
                <p>{aviso.conteudo}</p>

                {aviso.periodoInscricao && (
                  <div className="bg-blue-600 text-white p-3 rounded">
                    <p>
                      <strong>Período de inscrição:</strong> {aviso.periodoInscricao}
                    </p>
                  </div>
                )}

                {aviso.documentos && (
                  <div className="bg-blue-600 text-white p-3 rounded">
                    <p>
                      <strong>Documentos necessários:</strong> {aviso.documentos}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Publicado em: {formatDate(aviso.dataPublicacao)}</p>

                <Button variant="secondary" onClick={() => handleOpenModal(aviso)}>
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
            <DialogTitle>{selectedAviso?.titulo}</DialogTitle>
          </DialogHeader>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
