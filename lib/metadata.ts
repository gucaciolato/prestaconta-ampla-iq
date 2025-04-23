import type { Metadata } from "next"

// Configuração do site
export const siteConfig = {
  name: "PrestaConta - Ampla",
  description: "Plataforma de transparência e prestação de contas da Ampla",
  url: "https://ampla.prestaconta.com.br",
  ogImage: "https://ampla.prestaconta.com.br/og-image.png",
}

// Metadados padrão
export const metaTitle = "PrestaConta - Ampla"
export const metaDescription = "Plataforma de transparência e prestação de contas da Ampla"
export const metaUrl = "https://ampla.prestaconta.com.br"
export const metaImage = `${metaUrl}/og-image.png`

// Função para gerar metadados
export function generateMetadata({
  title,
  description,
  image,
  path,
}: {
  title?: string
  description?: string
  image?: string
  path?: string
}): Metadata {
  const fullTitle = title ? `${title} | ${metaTitle}` : metaTitle
  const fullDescription = description || metaDescription
  const fullImage = image || metaImage
  const fullUrl = path ? `${metaUrl}${path}` : metaUrl

  return {
    title: fullTitle,
    description: fullDescription,
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: metaTitle,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "pt_BR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
    },
    metadataBase: new URL(metaUrl),
    alternates: {
      canonical: fullUrl,
    },
  }
}
