"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Pencil, UserPlus, UserCheck, UserX } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { UserRole } from "@/lib/types"

interface User {
  id: string
  username: string
  nome: string
  email?: string
  role: UserRole
  ativo: boolean
  dataCriacao: string
  ultimoAcesso?: string
}

export default function UsuariosPage() {
  const { hasPermission } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    nome: "",
    email: "",
    role: "membro" as UserRole,
  })

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/usuarios")

      if (!response.ok) {
        throw new Error("Falha ao carregar usuários")
      }

      const data = await response.json()
      setUsers(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários. Tente novamente mais tarde.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Verificar permissão
  if (!hasPermission("usuarios")) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </CardContent>
      </Card>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as UserRole }))
  }

  const resetForm = () => {
    setFormData({
      id: "",
      username: "",
      password: "",
      nome: "",
      email: "",
      role: "membro",
    })
    setIsEditing(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username || (!isEditing && !formData.password) || !formData.nome || !formData.role) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const payload = { ...formData }

      // Se estiver editando e a senha estiver vazia, remove do payload
      if (isEditing && !payload.password) {
        delete payload.password
      }

      const url = isEditing ? `/api/usuarios/${formData.id}` : "/api/usuarios"
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
        throw new Error(errorData.error || "Falha ao salvar usuário")
      }

      toast({
        title: "Sucesso",
        description: isEditing ? "Usuário atualizado com sucesso!" : "Usuário cadastrado com sucesso!",
      })

      resetForm()
      setOpenDialog(false)
      fetchUsers()
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o usuário. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (user: User) => {
    setFormData({
      id: user.id,
      username: user.username,
      password: "", // Não preencher a senha ao editar
      nome: user.nome,
      email: user.email || "",
      role: user.role,
    })
    setIsEditing(true)
    setOpenDialog(true)
  }

  // Verificando o comportamento de ativação/desativação
  const handleToggleStatus = async (id: string, ativo: boolean) => {
    try {
      const action = ativo ? "deactivate" : "activate"

      const response = await fetch(`/api/usuarios/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar status do usuário")
      }

      toast({
        title: "Sucesso",
        description: `Usuário ${ativo ? "desativado" : "ativado"} com sucesso!`,
      })

      fetchUsers()
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status do usuário. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nunca"

    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRoleName = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      admin: "Administrador",
      presidente: "Presidente",
      "vice-presidente": "Vice-Presidente",
      tesoureiro: "Tesoureiro",
      "1-tesoureiro": "1º Tesoureiro",
      "2-tesoureiro": "2º Tesoureiro",
      secretario: "Secretário",
      "1-secretario": "1º Secretário",
      "2-secretario": "2º Secretário",
      membro: "Membro",
    }

    return roleNames[role] || role
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Atualize os dados do usuário selecionado"
                  : "Preencha os dados para cadastrar um novo usuário"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isEditing}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">
                    Senha{" "}
                    {isEditing && <span className="text-sm text-muted-foreground">(deixe em branco para manter)</span>}
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEditing}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Papel</Label>
                  <Select value={formData.role} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="presidente">Presidente</SelectItem>
                      <SelectItem value="vice-presidente">Vice-Presidente</SelectItem>
                      <SelectItem value="1-tesoureiro">1º Tesoureiro</SelectItem>
                      <SelectItem value="2-tesoureiro">2º Tesoureiro</SelectItem>
                      <SelectItem value="tesoureiro">Tesoureiro</SelectItem>
                      <SelectItem value="1-secretario">1º Secretário</SelectItem>
                      <SelectItem value="2-secretario">2º Secretário</SelectItem>
                      <SelectItem value="secretario">Secretário</SelectItem>
                      <SelectItem value="membro">Membro</SelectItem>
                    </SelectContent>
                  </Select>
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

      <Tabs defaultValue="ativos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ativos">Usuários Ativos</TabsTrigger>
          <TabsTrigger value="inativos">Usuários Inativos</TabsTrigger>
        </TabsList>

        <TabsContent value="ativos">
          {isLoading ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Carregando usuários...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Usuários Ativos</CardTitle>
                <CardDescription>Lista de usuários ativos no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {users.filter((user) => user.ativo).length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Nenhum usuário ativo encontrado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-3 border-b">Nome</th>
                          <th className="text-left p-3 border-b">Usuário</th>
                          <th className="text-left p-3 border-b">Papel</th>
                          <th className="text-left p-3 border-b">Último Acesso</th>
                          <th className="text-center p-3 border-b">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter((user) => user.ativo)
                          .map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{user.nome}</td>
                              <td className="p-3">{user.username}</td>
                              <td className="p-3">{getRoleName(user.role)}</td>
                              <td className="p-3">{formatDate(user.ultimoAcesso)}</td>
                              <td className="p-3 text-center">
                                <div className="flex justify-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-amber-500">
                                        <UserX className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Desativar Usuário</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Tem certeza que deseja desativar o usuário {user.nome}? Ele não poderá mais
                                          acessar o sistema.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleToggleStatus(user.id, true)}
                                          className="bg-amber-500 hover:bg-amber-600"
                                        >
                                          Desativar
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inativos">
          {isLoading ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Carregando usuários...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Usuários Inativos</CardTitle>
                <CardDescription>Lista de usuários inativos no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {users.filter((user) => !user.ativo).length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Nenhum usuário inativo encontrado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left p-3 border-b">Nome</th>
                          <th className="text-left p-3 border-b">Usuário</th>
                          <th className="text-left p-3 border-b">Papel</th>
                          <th className="text-left p-3 border-b">Último Acesso</th>
                          <th className="text-center p-3 border-b">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter((user) => !user.ativo)
                          .map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                              <td className="p-3">{user.nome}</td>
                              <td className="p-3">{user.username}</td>
                              <td className="p-3">{getRoleName(user.role)}</td>
                              <td className="p-3">{formatDate(user.ultimoAcesso)}</td>
                              <td className="p-3 text-center">
                                <div className="flex justify-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-500"
                                    onClick={() => handleToggleStatus(user.id, false)}
                                  >
                                    <UserCheck className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
