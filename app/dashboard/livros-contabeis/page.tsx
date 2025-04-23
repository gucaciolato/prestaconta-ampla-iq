"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react"
import { uploadFile } from "@/hooks/use-api"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Documento {
  _id: string
  titulo: string
  tipo: string
  ano: string
  url: string
  fileId?: string
}

export default function LivrosContabeisDashboardPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    _id: "",
    titulo: "",
    tipo: "livro",
    ano: new Date().getFullYear().toString(),
    url: "",
    fileId: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  // Gerar lista de anos (últimos 10 anos)
  const anoAtual = new Date().getFullYear()
  const anos = Array.from({ length: 10 }, (_, i) => (anoAtual - i).toString())
  const [mostrarInputAno, setMostrarInputAno] = useState(false)

  useEffect(() => {
    fetchDocumentos()
  }, [])

  async function fetchDocumentos() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/documentos?tipo=livro")

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)

      let documentUrl = formData.url
      let fileId = formData.fileId

      // Upload file if selected
      if (file) {
        const uploadResult = await uploadFile(file)
        if (uploadResult && uploadResult.url) {
          documentUrl = uploadResult.url
          fileId = uploadResult.fileId || ""
        } else {
          toast({
            title: "Erro",
            description: "Falha ao fazer upload do documento.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      } else if (!isEditing || !formData.url) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um documento.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const payload = {
        ...formData,
        url: documentUrl,
        fileId: fileId,
      }

      // Remove _id from payload if creating new
      if (!isEditing) {
        delete payload._id
      }

      const url = isEditing ? `/api/documentos/${formData._id}` : "/api/documentos"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Erro ao ${isEditing ? "atualizar" : "adicionar"} documento`)
      }

      toast({
        title: isEditing ? "Documento atualizado" : "Documento adicionado",
        description: isEditing ? "O documento foi atualizado com sucesso." : "O documento foi adicionado com sucesso.",
      })

      resetForm()
      setOpenDialog(false)
      fetchDocumentos()
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro",
        description: `Falha ao ${isEditing ? "atualizar" : "adicionar"} documento. Tente novamente.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (documento: Documento) => {
    setFormData({
      _id: documento._id,
      titulo: documento.titulo,
      tipo: documento.tipo,
      ano: documento.ano,
      url: documento.url,
      fileId: documento.fileId || "",
    })
    setFile(null)
    setIsEditing(true)

    // Verificar se o ano está na lista predefinida
    if (!anos.includes(documento.ano)) {
      setMostrarInputAno(true)
    } else {
      setMostrarInputAno(false)
    }

    setOpenDialog(true)
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setOpenDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/documentos/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir documento")
      }

      toast({
        title: "Documento excluído",
        description: "O documento foi excluído com sucesso.",
      })

      fetchDocumentos()
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro",
        description: "Falha ao excluir documento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setOpenDeleteDialog(false)
      setDeleteId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      _id: "",
      titulo: "",
      tipo: "livro",
      ano: new Date().getFullYear().toString(),
      url: "",
      fileId: "",
    })
    setFile(null)
    setIsEditing(false)
    setMostrarInputAno(false)
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Livros Contábeis</h1>
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-20 w-20 rounded-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Livros Contábeis</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar" : "Adicionar"} Documento</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para {isEditing ? "editar" : "adicionar"} um documento contábil.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ano">Ano</Label>
                  {!mostrarInputAno ? (
                    <div className="flex gap-2">
                      <Select
                        value={formData.ano}
                        onValueChange={(value) => {
                          if (value === "outro") {
                            setMostrarInputAno(true)
                          } else {
                            handleSelectChange("ano", value)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <div className="flex gap-2">
                      <Input
                        id="anoPersonalizado"
                        type="number"
                        min="1900"
                        max="2100"
                        value={formData.ano}
                        onChange={(e) => handleChange(e)}
                        name="ano"
                        placeholder="Digite o ano"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMostrarInputAno(false)
                          setFormData((prev) => ({ ...prev, ano: new Date().getFullYear().toString() }))
                        }}
                      >
                        Usar lista
                      </Button>
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="documento">Documento (PDF)</Label>
                  <Input id="documento" type="file" accept=".pdf" onChange={handleFileChange} />

                  {isEditing && formData.url && !file && (
                    <p className="text-sm text-gray-500">Documento atual: {formData.url.split("/").pop()}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm()
                    setOpenDialog(false)
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDocumentos} className="mt-2">
            Tentar novamente
          </Button>
        </div>
      )}

      {documentos.length === 0 && !error ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum documento cadastrado</h3>
          <p className="text-gray-500 mb-4">Adicione documentos contábeis para exibi-los aqui.</p>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Documento
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentos.map((doc) => (
            <Card key={doc._id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <FileText className="h-20 w-20 text-primary mb-4" />
                  <h3 className="font-semibold text-lg text-center mb-2">{doc.titulo}</h3>
                  <p className="text-sm text-gray-500 mb-4">Ano: {doc.ano}</p>

                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      onClick={() => confirmDelete(doc._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDeleteDialog(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
