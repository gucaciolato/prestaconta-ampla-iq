"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

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

export default function DiretoriaPage() {
  const [diretoria, setDiretoria] = useState<Diretoria | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setDiretoria(null)
      } else {
        setDiretoria(data)
      }
    } catch (err) {
      setError("Não foi possível carregar os dados da diretoria. Tente novamente mais tarde.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Quadro de Diretoria</h1>

        <div className="text-center mb-8">
          <Skeleton className="h-6 w-64 mx-auto" />
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader className="bg-black text-white">
              <CardTitle>Diretoria Executiva</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="py-4 px-6">
                        <Skeleton className="h-5 w-32" />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Skeleton className="h-5 w-48 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="bg-black text-white">
                <CardTitle>Conselho Fiscal</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="py-4 px-6">
                          <Skeleton className="h-5 w-8" />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Skeleton className="h-5 w-48 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-black text-white">
                <CardTitle>Suplentes do Conselho Fiscal</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="py-4 px-6">
                          <Skeleton className="h-5 w-8" />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Skeleton className="h-5 w-48 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Quadro de Diretoria</h1>

        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDiretoria} className="mt-2">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  if (!diretoria) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Quadro de Diretoria</h1>

        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Informações não disponíveis</h3>
          <p className="text-gray-500 mb-4">As informações sobre a diretoria ainda não foram cadastradas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Quadro de Diretoria</h1>

      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold">Mandato: {diretoria.mandato}</h2>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader className="bg-black text-white">
            <CardTitle>Diretoria Executiva</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <tbody>
                {diretoria.diretoriaExecutiva.map((membro, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="py-4 px-6 font-semibold">{membro.cargo}:</td>
                    <td className="py-4 px-6 text-right">{membro.nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="bg-black text-white">
              <CardTitle>Conselho Fiscal</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <tbody>
                  {diretoria.conselhoFiscal.map((membro, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="py-4 px-6 font-semibold">{index + 1}:</td>
                      <td className="py-4 px-6 text-right">{membro.nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-black text-white">
              <CardTitle>Suplentes do Conselho Fiscal</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <tbody>
                  {diretoria.suplentesConselhoFiscal.map((membro, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="py-4 px-6 font-semibold">{index + 1}:</td>
                      <td className="py-4 px-6 text-right">{membro.nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
