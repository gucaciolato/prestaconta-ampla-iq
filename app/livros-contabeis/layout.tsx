import type React from "react"
import { generateMetadata } from "@/lib/metadata"

export const metadata = generateMetadata({
  title: "Livros Contábeis",
  description: "Acesse os livros contábeis e documentos financeiros da AMPLA",
})

export default function LivrosContabeisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
