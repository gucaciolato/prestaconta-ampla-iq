"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const initializeDatabase = async () => {
    setIsLoading(true)
    setStatus("loading")
    setMessage("Inicializando banco de dados...")

    try {
      const response = await fetch("/api/init-db")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Banco de dados inicializado com sucesso! O usuário administrador foi criado.")
      } else {
        setStatus("error")
        setMessage(`Erro ao inicializar banco de dados: ${data.message}`)
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Erro ao inicializar banco de dados: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image src="/presta-conta-logo.svg" alt="PrestaConta Logo" width={180} height={40} />
          </div>
          <CardTitle className="text-2xl text-center">Configuração Inicial</CardTitle>
          <CardDescription className="text-center">
            Inicialize o banco de dados e crie o usuário administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <AlertDescription className="text-green-600">{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              Esta página irá inicializar o banco de dados e criar o usuário administrador conforme definido nas
              variáveis de ambiente <code>NEXT_PUBLIC_USUARIO_LOGIN</code> e <code>NEXT_PUBLIC_SENHA_LOGIN</code>.
            </p>
            <p className="text-sm text-gray-500">
              Certifique-se de que as variáveis de ambiente estão configuradas corretamente antes de prosseguir.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" onClick={initializeDatabase} disabled={isLoading || status === "success"}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inicializando...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Inicializado com Sucesso
              </>
            ) : (
              "Inicializar Banco de Dados"
            )}
          </Button>

          {status === "success" && (
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Ir para o Login
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
