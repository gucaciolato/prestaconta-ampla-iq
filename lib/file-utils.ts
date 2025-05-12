/**
 * Verifica se uma URL de arquivo é válida e a corrige se necessário
 */
export function ensureValidFileUrl(url: string): string {
  if (!url) {
    console.warn("[FILE-UTILS] URL vazia fornecida")
    return ""
  }

  console.log(`[FILE-UTILS] Processando URL: ${url}`)

  // Se a URL já começa com /api/files/, está correta
  if (url.startsWith("/api/files/")) {
    console.log(`[FILE-UTILS] URL já está no formato correto: ${url}`)
    return url
  }

  // Se a URL é um ID do MongoDB (24 caracteres hexadecimais)
  if (/^[0-9a-fA-F]{24}$/.test(url)) {
    const correctedUrl = `/api/files/${url}`
    console.log(`[FILE-UTILS] URL convertida de ID para: ${correctedUrl}`)
    return correctedUrl
  }

  // Tenta extrair o ID do MongoDB da URL
  const fileId = extractFileIdFromUrl(url)
  if (fileId) {
    const correctedUrl = `/api/files/${fileId}`
    console.log(`[FILE-UTILS] ID extraído da URL: ${fileId}, URL corrigida: ${correctedUrl}`)
    return correctedUrl
  }

  // Se não conseguiu corrigir, retorna a URL original
  console.warn(`[FILE-UTILS] URL de arquivo potencialmente inválida: ${url}`)
  return url
}

/**
 * Extrai o ID do arquivo de uma URL
 */
export function extractFileIdFromUrl(url: string): string | null {
  if (!url) return null

  // Tenta extrair o ID do padrão /api/files/ID
  const apiFilesMatch = url.match(/\/api\/files\/([0-9a-fA-F]{24})/)
  if (apiFilesMatch && apiFilesMatch[1]) {
    return apiFilesMatch[1]
  }

  // Tenta extrair o ID do padrão /files/ID
  const filesMatch = url.match(/\/files\/([0-9a-fA-F]{24})/)
  if (filesMatch && filesMatch[1]) {
    return filesMatch[1]
  }

  // Verifica se a própria URL é um ID válido
  if (/^[0-9a-fA-F]{24}$/.test(url)) {
    return url
  }

  return null
}
