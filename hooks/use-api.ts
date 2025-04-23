"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

interface FetchOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
}

export async function uploadFile(file: File) {
  try {
    console.log(`[API] Iniciando upload do arquivo: ${file.name}, tamanho: ${file.size} bytes, tipo: ${file.type}`)
    const formData = new FormData()
    formData.append("file", file)

    console.log("[API] Enviando requisição para /api/upload")
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    console.log(`[API] Resposta recebida: status ${response.status}`)

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error(`[API] Erro detalhado: ${JSON.stringify(errorData)}`)
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        console.error("[API] Não foi possível obter detalhes do erro:", e)
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log(`[API] Upload concluído com sucesso:`, data)

    return {
      success: true,
      url: data.fileUrl,
      fileId: data.fileId,
      fileName: data.fileName,
      fileType: data.contentType,
    }
  } catch (error) {
    console.error("[API] Erro ao fazer upload:", error)
    toast({
      title: "Erro no upload",
      description: error instanceof Error ? error.message : "Falha ao fazer upload do arquivo",
      variant: "destructive",
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao fazer upload do arquivo",
    }
  }
}

export function useApi<T>(url: string, options?: FetchOptions) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      console.log(`[API] Iniciando busca: ${url}`)
      setIsLoading(true)
      setError(null)

      const response = await fetch(url, {
        method: options?.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      })

      console.log(`[API] Resposta recebida: status ${response.status}`)

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          console.error(`[API] Erro detalhado: ${JSON.stringify(errorData)}`)
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error("[API] Não foi possível obter detalhes do erro:", e)
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log(`[API] Dados recebidos de ${url}:`, result)
      setData(result)
    } catch (err) {
      console.error(`[API] Erro ao buscar dados de ${url}:`, err)
      setError(err instanceof Error ? err : new Error("Erro desconhecido"))
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao carregar dados",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [url, options])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const mutate = useCallback(
    async (newOptions?: FetchOptions) => {
      const mergedOptions = { ...options, ...newOptions }
      try {
        setIsLoading(true)
        setError(null)

        console.log(`[API] Mutando dados: ${url}`, mergedOptions)
        const response = await fetch(url, {
          method: mergedOptions?.method || "GET",
          headers: {
            "Content-Type": "application/json",
            ...mergedOptions?.headers,
          },
          body: mergedOptions?.body ? JSON.stringify(mergedOptions.body) : undefined,
        })

        console.log(`[API] Resposta de mutação recebida: status ${response.status}`)

        if (!response.ok) {
          let errorMessage = `Erro ${response.status}: ${response.statusText}`
          try {
            const errorData = await response.json()
            console.error(`[API] Erro detalhado: ${JSON.stringify(errorData)}`)
            errorMessage = errorData.error || errorMessage
          } catch (e) {
            console.error("[API] Não foi possível obter detalhes do erro:", e)
          }

          throw new Error(errorMessage)
        }

        const result = await response.json()
        console.log(`[API] Dados de mutação recebidos:`, result)
        setData(result)
        return result
      } catch (err) {
        console.error(`[API] Erro ao mutar dados:`, err)
        setError(err instanceof Error ? err : new Error("Erro desconhecido"))
        toast({
          title: "Erro",
          description: err instanceof Error ? err.message : "Falha ao atualizar dados",
          variant: "destructive",
        })
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [url, options],
  )

  return { data, isLoading, error, mutate, refetch: fetchData }
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const upload = async (file: File): Promise<{ url: string; fileId: string }> => {
    setIsUploading(true)
    setProgress(0)
    setError(null)

    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10
          return newProgress > 90 ? 90 : newProgress
        })
      }, 300)

      console.log(`[useUpload] Iniciando upload de ${file.name}`)
      const result = await uploadFile(file)

      clearInterval(progressInterval)
      setProgress(100)
      setIsUploading(false)

      if (!result.success) {
        console.error(`[useUpload] Falha no upload: ${result.error}`)
        throw new Error(result.error || "Falha ao fazer upload do arquivo")
      }

      console.log(`[useUpload] Upload concluído com sucesso: ${result.fileId}`)
      return { url: result.url, fileId: result.fileId }
    } catch (err) {
      console.error(`[useUpload] Erro durante o upload:`, err)
      setError(err instanceof Error ? err : new Error("Erro desconhecido durante o upload"))
      setIsUploading(false)
      throw err
    }
  }

  return { upload, isUploading, progress, error }
}
