"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useApi } from "@/hooks/use-api"
import { usePermission } from "@/lib/auth-provider"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Edit, Plus, Save, Trash, X, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
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

// Definir o tipo de registro financeiro
interface RegistroFinanceiro {
  _id: string
  tipo: "receita" | "despesa"
  descricao: string
  valor: number
  data: string
  categoria: string
  fonte?: string
  observacoes?: string
  ano: string
  mes: string
}

export function FinanceiroContent() {
  const { data, isLoading, error, refetch } = useApi<RegistroFinanceiro[]>("/api/financeiro")
  const [registros, setRegistros] = useState<RegistroFinanceiro[]>([])
  const canEdit = usePermission("financeiro:manage")
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    tipo: "receita",
    descricao: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    categoria: "",
    fonte: "",
    observacoes: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  useEffect(() => {
    if (data) {
      setRegistros(data)
    }
  }, [data])

  const formatarValor = (valor: number) => {
    return formatCurrency(valor)
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      tipo: "receita",
      descricao: "",
      valor: "",
      data: new Date().toISOString().split("T")[0],
      categoria: "",
      fonte: "",
      observacoes: "",
    })
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      const valorNumerico = Number.parseFloat(formData.valor.replace(/[^\d,.-]/g, "").replace(",", "."))

      if (isNaN(valorNumerico)) {
        toast({
          title: "Erro",
          description: "Por favor, insira um valor válido.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const dataObj = new Date(formData.data)
      const ano = dataObj.getFullYear().toString()
      const mes = (dataObj.getMonth() + 1).toString()

      const dadosParaEnviar = {
        ...formData,
        valor: valorNumerico,
        ano,
        mes,
      }

      let response

      if (editingId) {
        // Atualizar registro existente
        response = await fetch(`/api/financeiro/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosParaEnviar),
        })
      } else {
        // Criar novo registro
        response = await fetch("/api/financeiro", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosParaEnviar),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao salvar o registro financeiro")
      }

      toast({
        title: "Sucesso",
        description: editingId ? "Registro atualizado com sucesso!" : "Registro criado com sucesso!",
      })

      resetForm()
      setShowForm(false)
      refetch()
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Ocorreu um erro ao salvar o registro. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (registro: RegistroFinanceiro) => {
    setFormData({
      tipo: registro.tipo,
      descricao: registro.descricao,
      valor: registro.valor.toString(),
      data: new Date(registro.data).toISOString().split("T")[0],
      categoria: registro.categoria || "",
      fonte: registro.fonte || "",
      observacoes: registro.observacoes || "",
    })
    setEditingId(registro._id)
    setShowForm(true)
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setOpenDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/financeiro/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao excluir o registro")
      }

      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso!",
      })

      refetch()
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Ocorreu um erro ao excluir o registro. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setOpenDeleteDialog(false)
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {canEdit && (
        <div className="flex justify-end">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Registro
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
            >
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          )}
        </div>
      )}

      {showForm && canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar Registro" : "Novo Registro"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    type="date"
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  type="text"
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    type="text"
                    id="valor"
                    name="valor"
                    value={formData.valor}
                    onChange={handleInputChange}
                    required
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    type="text"
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    placeholder={formData.tipo === "receita" ? "Ex: Doação, Subvenção" : "Ex: Pessoal, Material"}
                  />
                </div>
              </div>

              {formData.tipo === "receita" && (
                <div className="space-y-2">
                  <Label htmlFor="fonte">Fonte</Label>
                  <Input
                    type="text"
                    id="fonte"
                    name="fonte"
                    value={formData.fonte}
                    onChange={handleInputChange}
                    placeholder="Ex: Prefeitura, Doação Particular"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  placeholder="Observações adicionais (opcional)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
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
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingId ? "Atualizar" : "Salvar"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center justify-center p-6 text-red-500">
          <AlertCircle className="mr-2 h-5 w-5" />
          <span>Erro ao carregar os registros financeiros</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registros Financeiros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Data</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Descrição</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Categoria/Fonte
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipo</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Valor</th>
                  {canEdit && (
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {registros.length === 0 ? (
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td colSpan={canEdit ? 6 : 5} className="p-4 text-center text-muted-foreground">
                      Nenhum registro financeiro encontrado
                    </td>
                  </tr>
                ) : (
                  registros.map((registro) => (
                    <tr
                      key={registro._id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle">{formatarData(registro.data)}</td>
                      <td className="p-4 align-middle">{registro.descricao}</td>
                      <td className="p-4 align-middle">
                        {registro.tipo === "receita" ? registro.fonte : registro.categoria}
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            registro.tipo === "receita" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {registro.tipo === "receita" ? "Receita" : "Despesa"}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <span className={registro.tipo === "receita" ? "text-green-600" : "text-red-600"}>
                          {formatarValor(registro.valor)}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="p-4 align-middle">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(registro)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => confirmDelete(registro._id)}>
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro financeiro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDeleteDialog(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash className="h-4 w-4 mr-2" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
