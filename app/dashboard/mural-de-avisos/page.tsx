"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Pencil, Trash2, Loader2, FileText, ImageIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { uploadFile } from "@/hooks/use-api"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

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
  fileId?: string
}

export default function MuralDeAvisosDashboardPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    _id: "",
    titulo: "",
    conteudo: "",
    periodoInscricao: "",
    documentos: "",
    destaque: false,
    imagem: "",
    arquivoId: "",
    arquivoNome: "",
    arquivoTipo: "",
    fileId: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("todos")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileType, setFileType] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  useEffect(() => {
    fetchAvisos()
  }, [])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, destaque: checked }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      // Criar URL de preview para o arquivo
      if (selectedFile.type.startsWith("image/")) {
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)
        setFileType("image")
      } else if (selectedFile.type === "application/pdf") {
        const url = URL.createObjectURL(selectedFile)
        setPreviewUrl(url)
        setFileType("pdf")
      } else {
        setPreviewUrl(null)
        setFileType("other")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)

      let uploadResult = null

      // Upload file if selected
      if (file) {
        uploadResult = await uploadFile(file)
        if (!uploadResult || !uploadResult.success) {
          throw new Error("Falha ao fazer upload do arquivo")
        }
      }

      const payload: any = {
        ...formData,
      }

      // Remove _id from payload if creating new
      if (!isEditing) {
        delete payload._id
      }

      // Atualizar informações do arquivo se um novo arquivo foi enviado
      if (uploadResult) {
        if (file?.type.startsWith("image/")) {
          payload.imagem = uploadResult.url
          payload.fileId = uploadResult.fileId || ""
          payload.arquivoId = ""
          payload.arquivoNome = ""
          payload.arquivoTipo = ""
        } else {
          payload.imagem = ""
          payload.arquivoId = uploadResult.fileId
          payload.fileId = uploadResult.fileId || ""
          payload.arquivoNome = file?.name
          payload.arquivoTipo = file?.type
        }
      }

      const url = isEditing ? `/api/avisos/${formData._id}` : "/api/avisos"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Erro ao ${isEditing ? "atualizar" : "criar"} aviso`)
      }

      toast({
        title: isEditing ? "Aviso atualizado" : "Aviso criado",
        description: isEditing ? "O aviso foi atualizado com sucesso." : "O aviso foi criado com sucesso.",
      })

      resetForm()
      setOpenDialog(false)
      fetchAvisos()
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro",
        description: `Falha ao ${isEditing ? "atualizar" : "criar"} aviso. Tente novamente.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (aviso: Aviso) => {
    setFormData({
      _id: aviso._id,
      titulo: aviso.titulo,
      conteudo: aviso.conteudo,
      periodoInscricao: aviso.periodoInscricao || "",
      documentos: aviso.documentos || "",
      destaque: aviso.destaque || false,
      imagem: aviso.imagem || "",
      arquivoId: aviso.arquivoId || "",
      arquivoNome: aviso.arquivoNome || "",
      arquivoTipo: aviso.arquivoTipo || "",
      fileId: aviso.fileId || aviso.arquivoId || "",
    })

    setFile(null)
    setPreviewUrl(aviso.imagem || (aviso.arquivoId ? `/api/files/${aviso.arquivoId}` : null))
    setFileType(aviso.imagem ? "image" : aviso.arquivoTipo?.includes("pdf") ? "pdf" : "other")

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
      const response = await fetch(`/api/avisos/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir aviso")
      }

      toast({
        title: "Aviso excluído",
        description: "O aviso foi excluído com sucesso.",
      })

      fetchAvisos()
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro",
        description: "Falha ao excluir aviso. Tente novamente.",
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
      conteudo: "",
      periodoInscricao: "",
      documentos: "",
      destaque: false,
      imagem: "",
      arquivoId: "",
      arquivoNome: "",
      arquivoTipo: "",
      fileId: "",
    })
    setFile(null)
    setPreviewUrl(null)
    setFileType(null)
    setIsEditing(false)
  }

  const filteredAvisos = activeTab === "destaque" ? avisos.filter((aviso) => aviso.destaque) : avisos

  const renderFilePreview = () => {
    if (!previewUrl) return null

    if (fileType === "image") {
      return (
        <div className="mt-2 border rounded-md p-2">
          <p className="text-sm text-gray-500 mb-2">Preview da imagem:</p>
          <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="max-h-40 max-w-full object-contain" />
        </div>
      )
    } else if (fileType === "pdf") {
      return (
        <div className="mt-2 border rounded-md p-2">
          <p className="text-sm text-gray-500 mb-2">Preview do PDF:</p>
          <iframe src={previewUrl} className="w-full h-40" title="PDF Preview" />
        </div>
      )
    } else if (fileType === "other") {
      return (
        <div className="mt-2 border rounded-md p-2 flex items-center">
          <FileText className="h-6 w-6 text-gray-500 mr-2" />
          <p className="text-sm text-gray-500">Arquivo selecionado: {file?.name}</p>
        </div>
      )
    }

    return null
  }

  const renderFileIcon = (aviso: Aviso) => {
    if (aviso.imagem) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    } else if (aviso.arquivoId) {
      if (aviso.arquivoTipo?.includes("pdf")) {
        return <FileText className="h-4 w-4 text-red-500" />
      } else {
        return <FileText className="h-4 w-4 text-gray-500" />
      }
    }
    return null
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Mural de Avisos</h1>
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando
          </Button>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-4">
                <Skeleton className="h-16 w-full mb-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mural de Avisos</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Aviso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Aviso" : "Novo Aviso"}</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para {isEditing ? "editar o" : "criar um novo"} aviso.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input id="titulo" name="titulo" value={formData.titulo} onChange={handleChange} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="conteudo">Conteúdo</Label>
                  <Textarea
                    id="conteudo"
                    name="conteudo"
                    rows={5}
                    value={formData.conteudo}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="periodoInscricao">Período de Inscrição (opcional)</Label>
                  <Input
                    id="periodoInscricao"
                    name="periodoInscricao"
                    value={formData.periodoInscricao}
                    onChange={handleChange}
                    placeholder="Ex: 01/01/2024 a 31/01/2024"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="documentos">Documentos Necessários (opcional)</Label>
                  <Input
                    id="documentos"
                    name="documentos"
                    value={formData.documentos}
                    onChange={handleChange}
                    placeholder="Ex: RG, CPF, Comprovante de Residência"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="arquivo">Arquivo (PDF ou Imagem)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="arquivo"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                  </div>
                  {renderFilePreview()}

                  {!file && isEditing && (formData.imagem || formData.arquivoId) && (
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      {renderFileIcon(formData as Aviso)}
                      <span className="ml-2">
                        {formData.imagem
                          ? "Imagem atual será mantida"
                          : formData.arquivoNome
                            ? `Arquivo atual: ${formData.arquivoNome}`
                            : "Arquivo atual será mantido"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="destaque" checked={formData.destaque} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="destaque">Destacar aviso</Label>
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

      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="destaque">Destaques</TabsTrigger>
        </TabsList>
        <TabsContent value="todos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Avisos</CardTitle>
              <CardDescription>Gerencie todos os avisos publicados no mural.</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
                  <p>{error}</p>
                  <Button variant="outline" size="sm" onClick={fetchAvisos} className="mt-2">
                    Tentar novamente
                  </Button>
                </div>
              )}

              {avisos.length === 0 && !error ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Nenhum aviso publicado.</p>
                  <Button onClick={() => setOpenDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Aviso
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAvisos.map((aviso) => (
                    <div
                      key={aviso._id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{aviso.titulo}</h3>
                          {aviso.destaque && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                              Destaque
                            </Badge>
                          )}
                          {renderFileIcon(aviso)}
                        </div>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{aviso.conteudo}</p>
                        <p className="text-xs text-gray-400">Publicado em: {formatDate(aviso.dataPublicacao)}</p>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(aviso)}>
                          <Pencil className="h-4 w-4 mr-1" /> Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => confirmDelete(aviso._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">Mostrando {filteredAvisos.length} avisos no total.</p>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="destaque" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avisos em Destaque</CardTitle>
              <CardDescription>Gerencie os avisos marcados como destaque.</CardDescription>
            </CardHeader>
            <CardContent>
              {avisos.filter((a) => a.destaque).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Nenhum aviso em destaque.</p>
                  <Button onClick={() => setOpenDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Aviso em Destaque
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAvisos.map((aviso) => (
                    <div
                      key={aviso._id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{aviso.titulo}</h3>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                            Destaque
                          </Badge>
                          {renderFileIcon(aviso)}
                        </div>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{aviso.conteudo}</p>
                        <p className="text-xs text-gray-400">Publicado em: {formatDate(aviso.dataPublicacao)}</p>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(aviso)}>
                          <Pencil className="h-4 w-4 mr-1" /> Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => confirmDelete(aviso._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Mostrando {avisos.filter((aviso) => aviso.destaque).length} avisos em destaque.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDeleteDialog(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
