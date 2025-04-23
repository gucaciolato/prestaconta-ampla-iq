"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Membro {
  cargo: string
  nome: string
}

interface Diretoria {
  _id?: string
  mandato: string
  diretoriaExecutiva: Membro[]
  conselhoFiscal: Membro[]
  suplentesConselhoFiscal: Membro[]
}

export default function DiretoriaDashboardPage() {
  const [diretoria, setDiretoria] = useState<Diretoria>({
    mandato: "",
    diretoriaExecutiva: [
      { cargo: "Presidente", nome: "" },
      { cargo: "Vice-Presidente", nome: "" },
      { cargo: "1° Secretário", nome: "" },
      { cargo: "2° Secretário", nome: "" },
      { cargo: "1° Tesoureiro", nome: "" },
      { cargo: "2° Tesoureiro", nome: "" },
    ],
    conselhoFiscal: [
      { cargo: "1", nome: "" },
      { cargo: "2", nome: "" },
      { cargo: "3", nome: "" },
    ],
    suplentesConselhoFiscal: [
      { cargo: "1", nome: "" },
      { cargo: "2", nome: "" },
      { cargo: "3", nome: "" },
    ],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    fetchDiretoria()
  }, [])

  async function fetchDiretoria() {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/diretoria")

      if (!response.ok) {
        throw new Error("Falha ao carregar dados da diretoria")
      }

      const data = await response.json()

      if (Object.keys(data).length === 0) {
        // No data yet
        setHasData(false)
      } else {
        setDiretoria(data)
        setHasData(true)
      }
    } catch (err) {
      setError("Não foi possível carregar os dados da diretoria. Tente novamente mais tarde.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === "mandato") {
      setDiretoria((prev) => ({ ...prev, mandato: value }))
    }
  }

  const handleMembroChange = (
    type: "diretoriaExecutiva" | "conselhoFiscal" | "suplentesConselhoFiscal",
    index: number,
    value: string,
  ) => {
    setDiretoria((prev) => {
      const newData = { ...prev }
      newData[type][index].nome = value
      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/diretoria", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(diretoria),
      })

      if (!response.ok) {
        throw new Error("Falha ao salvar dados da diretoria")
      }

      toast({
        title: "Dados salvos",
        description: "Os dados da diretoria foram salvos com sucesso.",
      })

      setHasData(true)
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro",
        description: "Falha ao salvar dados da diretoria. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Quadro de Diretoria</h1>
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações do Mandato</CardTitle>
            <CardDescription>Período de vigência da atual diretoria</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Diretoria Executiva</CardTitle>
            <CardDescription>Membros da diretoria executiva</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full md:col-span-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Quadro de Diretoria</h1>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDiretoria} className="mt-2">
            Tentar novamente
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações do Mandato</CardTitle>
            <CardDescription>Período de vigência da atual diretoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mandato">Período do Mandato</Label>
                <Input
                  id="mandato"
                  name="mandato"
                  placeholder="Ex: 14/01/2025 - 14/01/2027"
                  value={diretoria.mandato}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Diretoria Executiva</CardTitle>
            <CardDescription>Membros da diretoria executiva</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diretoria.diretoriaExecutiva.map((membro, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Label htmlFor={`diretoria-${index}`} className="font-medium">
                    {membro.cargo}:
                  </Label>
                  <Input
                    id={`diretoria-${index}`}
                    value={membro.nome}
                    onChange={(e) => handleMembroChange("diretoriaExecutiva", index, e.target.value)}
                    className="md:col-span-2"
                    required
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Conselho Fiscal</CardTitle>
              <CardDescription>Membros do conselho fiscal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diretoria.conselhoFiscal.map((membro, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <Label htmlFor={`conselho-${index}`} className="font-medium md:col-span-1">
                      {index + 1}:
                    </Label>
                    <Input
                      id={`conselho-${index}`}
                      value={membro.nome}
                      onChange={(e) => handleMembroChange("conselhoFiscal", index, e.target.value)}
                      className="md:col-span-3"
                      required
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suplentes do Conselho</CardTitle>
              <CardDescription>Suplentes do conselho fiscal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diretoria.suplentesConselhoFiscal.map((membro, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <Label htmlFor={`suplente-${index}`} className="font-medium md:col-span-1">
                      {index + 1}:
                    </Label>
                    <Input
                      id={`suplente-${index}`}
                      value={membro.nome}
                      onChange={(e) => handleMembroChange("suplentesConselhoFiscal", index, e.target.value)}
                      className="md:col-span-3"
                      required
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Esta página não tem funcionalidade de exclusão, pois é uma página de edição de um único registro
// Não há necessidade de implementar exclusão aqui
