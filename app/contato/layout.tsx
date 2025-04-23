import type React from "react"
import { generateMetadata } from "@/lib/metadata"

export const metadata = generateMetadata({
  title: "Contato",
  description: "Entre em contato com a AMPLA - Associação de Assistência ao Menor de Platina",
})

export default function ContatoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
