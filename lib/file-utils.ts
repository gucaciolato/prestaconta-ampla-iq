/**
 * Verifica se uma URL de arquivo é válida e a corrige se necessário
 * @param url URL do arquivo a ser verificada
 * @returns URL corrigida
 */
export function ensureValidFileUrl(url: string): string {
  // Se a URL já começa com http:// ou https://, assumimos que é uma URL externa válida
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  // Se a URL começa com /api/files/, verificamos se o ID do arquivo é válido
  if (url.startsWith("/api/files/")) {
    const fileId = url.replace("/api/files/", "")

    // Verificar se o ID é um ObjectId válido do MongoDB (24 caracteres hexadecimais)
    if (!/^[0-9a-fA-F]{24}$/.test(fileId)) {
      console.error(`[FILE-UTILS] ID de arquivo inválido na URL: ${url}`)
      // Retornar uma URL de fallback ou a URL original
      return url
    }

    // A URL parece válida
    return url
  }

  // Se a URL não segue nenhum dos padrões esperados, tentamos corrigir
  // Verificar se a URL contém um ID de arquivo válido em algum lugar
  const matches = url.match(/([0-9a-fA-F]{24})/)
  if (matches && matches[1]) {
    const fileId = matches[1]
    console.log(`[FILE-UTILS] Corrigindo URL de arquivo: ${url} -> /api/files/${fileId}`)
    return `/api/files/${fileId}`
  }

  // Se não conseguimos corrigir, retornamos a URL original
  console.warn(`[FILE-UTILS] Não foi possível corrigir a URL de arquivo: ${url}`)
  return url
}

/**
 * Extrai o ID do arquivo de uma URL
 * @param url URL do arquivo
 * @returns ID do arquivo ou null se não for possível extrair
 */
export function extractFileIdFromUrl(url: string): string | null {
  // Se a URL começa com /api/files/, extraímos o ID
  if (url.startsWith("/api/files/")) {
    return url.replace("/api/files/", "")
  }

  // Tentar encontrar um ID de arquivo válido na URL
  const matches = url.match(/([0-9a-fA-F]{24})/)
  if (matches && matches[1]) {
    return matches[1]
  }

  return null
}
