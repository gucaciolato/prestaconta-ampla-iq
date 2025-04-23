"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Plus, Pencil, Trash2, ImageIcon, Loader2 } from "lucide-react"
import { uploadFile } from "@/hooks/use-api"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface Foto {
  _id: string
  titulo: string
  descricao: string
  data: string
  url: string
  ano: string
  mes: string
  fileId?: string
}

export default function GaleriaDashboardPage() {
  const [fotos, setFotos] = useState<Foto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    _id: "",
    titulo: "",
    descricao: "",
    data: "",
    url: "",
    fileId: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  useEffect(() => {
    fetchFotos()
  }, [])

  useEffect(() => {
    // Create preview URL for selected file
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Free memory when component unmounts
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  async function fetchFotos() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/galeria")

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
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

      let imageUrl = formData.url
      let fileId = formData.fileId

      // Upload file if selected
      if (file) {
        const uploadResult = await uploadFile(file)
        if (uploadResult && uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url
          fileId = uploadResult.fileId || ""
        } else {
          toast({
            title: "Erro",
            description: "Falha ao fazer upload da imagem.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      } else if (!isEditing || !formData.url) {
        toast({
          title: "Erro",
          description: "Por favor, selecione uma imagem.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const payload = {
        ...formData,
        url: imageUrl,
        fileId: fileId,
      }

      // Remove _id from payload if creating new
      if (!isEditing) {
        delete payload._id
      }

      const url = isEditing ? `/api/galeria/${formData._id}` : "/api/galeria"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao ${isEditing ? "atualizar" : "adicionar"} foto`)
      }

      toast({
        title: isEditing ? "Foto atualizada" : "Foto adicionada",
        description: isEditing ? "A foto foi atualizada com sucesso." : "A foto foi adicionada com sucesso.",
      })

      resetForm()
      setOpenDialog(false)
      fetchFotos()
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro",
        description:
          err instanceof Error
            ? err.message
            : `Falha ao ${isEditing ? "atualizar" : "adicionar"} foto. Tente novamente.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (foto: Foto) => {
    setFormData({
      _id: foto._id,
      titulo: foto.titulo,
      descricao: foto.descricao,
      data: foto.data.split("T")[0], // Format date for input
      url: foto.url,
      fileId: foto.fileId || "",
    })
    setFile(null)
    setPreviewUrl(foto.url)
    setIsEditing(true)
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
      const response = await fetch(`/api/galeria/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao excluir foto")
      }

      toast({
        title: "Foto excluída",
        description: "A foto foi excluída com sucesso.",
      })

      fetchFotos()
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao excluir foto. Tente novamente.",
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
      descricao: "",
      data: "",
      url: "",
      fileId: "",
    })
    setFile(null)
    setPreviewUrl(null)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Galeria de Fotos</h1>
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="h-48 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
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
        <h1 className="text-3xl font-bold tracking-tight">Galeria de Fotos</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Foto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar" : "Adicionar"} Foto</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para {isEditing ? "editar" : "adicionar"} uma foto à galeria.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    rows={3}
                    value={formData.descricao}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="data">Data</Label>
                  <Input id="data" name="data" type="date" value={formData.data} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="imagem">Imagem</Label>
                  <Input id="imagem" type="file" accept="image/*" onChange={handleFileChange} />

                  {previewUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2">Pré-visualização:</p>
                      <div className="relative h-48 w-full rounded-md overflow-hidden border">
                        <Image
                          src={previewUrl || "/placeholder.svg"}
                          alt="Pré-visualização"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
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
          <Button variant="outline" size="sm" onClick={fetchFotos} className="mt-2">
            Tentar novamente
          </Button>
        </div>
      )}

      {fotos.length === 0 && !error ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma foto cadastrada</h3>
          <p className="text-gray-500 mb-4">Adicione fotos à galeria para exibi-las aqui.</p>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Foto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fotos.map((foto) => (
            <Card key={foto._id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image src={foto.url || "/placeholder.svg"} alt={foto.titulo} fill className="object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1">{foto.titulo}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{foto.descricao}</p>
                <p className="text-xs text-gray-500">Data: {new Date(foto.data).toLocaleDateString("pt-BR")}</p>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(foto)}>
                    <Pencil className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => confirmDelete(foto._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
                  </Button>
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
              Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.
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
