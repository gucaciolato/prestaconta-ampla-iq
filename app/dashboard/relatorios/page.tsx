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

interface Relatorio {
  _id: string
  titulo: string
  tipo: string
  ano: string
  mes: string
  url: string
  fileId?: string
}

export default function RelatoriosDashboardPage() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    _id: "",
    titulo: "",
    tipo: "relatorio",
    ano: new Date().getFullYear().toString(),
    mes: (new Date().getMonth() + 1).toString(),
    url: "",
    fileId: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [anoCustom, setAnoCustom] = useState<boolean>(false)

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
  }, [])

  async function fetchRelatorios() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/documentos?tipo=relatorio")

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "ano" && value === "custom") {
      setAnoCustom(true)
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "ano") {
      setAnoCustom(false)
    }
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
        console.log(`[Relatórios] Iniciando upload do arquivo: ${file.name}`)
        const uploadResult = await uploadFile(file)
        console.log(`[Relatórios] Resultado do upload:`, uploadResult)

        if (uploadResult && uploadResult.url) {
          documentUrl = uploadResult.url
          fileId = uploadResult.fileId || ""
          console.log(`[Relatórios] URL do documento: ${documentUrl}, FileID: ${fileId}`)
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
        throw new Error(`Erro ao ${isEditing ? "atualizar" : "adicionar"} relatório`)
      }

      toast({
        title: isEditing ? "Relatório atualizado" : "Relatório adicionado",
        description: isEditing ? "O relatório foi atualizado com sucesso." : "O relatório foi adicionado com sucesso.",
      })

      resetForm()
      setOpenDialog(false)
      fetchRelatorios()
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro",
        description: `Falha ao ${isEditing ? "atualizar" : "adicionar"} relatório. Tente novamente.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (relatorio: Relatorio) => {
    // Verificar se o ano está na lista predefinida
    const anoNaLista = anos.includes(relatorio.ano)

    setFormData({
      _id: relatorio._id,
      titulo: relatorio.titulo,
      tipo: relatorio.tipo,
      ano: relatorio.ano,
      mes: relatorio.mes,
      url: relatorio.url,
      fileId: relatorio.fileId || "",
    })
    setFile(null)
    setIsEditing(true)
    setAnoCustom(!anoNaLista)
    setOpenDialog(true)
  }

  // Verificando o comportamento de exclusão
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
        throw new Error("Falha ao excluir relatório")
      }

      toast({
        title: "Relatório excluído",
        description: "O relatório foi excluído com sucesso.",
      })

      fetchRelatorios()
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro",
        description: "Falha ao excluir relatório. Tente novamente.",
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
      tipo: "relatorio",
      ano: new Date().getFullYear().toString(),
      mes: (new Date().getMonth() + 1).toString(),
      url: "",
      fileId: "",
    })
    setFile(null)
    setIsEditing(false)
    setAnoCustom(false)
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Relatórios de Atividade</h1>
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
        <h1 className="text-3xl font-bold tracking-tight">Relatórios de Atividade</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar" : "Adicionar"} Relatório</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para {isEditing ? "editar" : "adicionar"} um relatório de atividade.
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
                  {anoCustom ? (
                    <div className="flex gap-2">
                      <Input
                        id="ano"
                        name="ano"
                        type="number"
                        value={formData.ano}
                        onChange={handleChange}
                        placeholder="Digite o ano"
                        min="1900"
                        max="2100"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAnoCustom(false)}
                        className="whitespace-nowrap"
                      >
                        Usar lista
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select
                        value={anos.includes(formData.ano) ? formData.ano : "custom"}
                        onValueChange={(value) => handleSelectChange("ano", value)}
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
                          <SelectItem value="custom">Outro ano...</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mes">Mês</Label>
                  <Select value={formData.mes} onValueChange={(value) => handleSelectChange("mes", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map((mes) => (
                        <SelectItem key={mes.value} value={mes.value}>
                          {mes.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          <Button variant="outline" size="sm" onClick={fetchRelatorios} className="mt-2">
            Tentar novamente
          </Button>
        </div>
      )}

      {relatorios.length === 0 && !error ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum relatório cadastrado</h3>
          <p className="text-gray-500 mb-4">Adicione relatórios de atividade para exibi-los aqui.</p>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Relatório
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatorios.map((relatorio) => (
            <Card key={relatorio._id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <FileText className="h-20 w-20 text-red-500 mb-4" />
                  <h3 className="font-semibold text-lg text-center mb-2">{relatorio.titulo}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {meses.find((m) => m.value === relatorio.mes)?.label || ""} / {relatorio.ano}
                  </p>

                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(relatorio)}>
                      <Pencil className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                      onClick={() => confirmDelete(relatorio._id)}
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
              Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita.
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
