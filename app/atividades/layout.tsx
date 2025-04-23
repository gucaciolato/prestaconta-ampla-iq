import type React from "react"
import type { Metadata } from "next"
import { siteConfig } from "@/lib/metadata"

export const metadata: Metadata = {
  title: `Atividades Recentes | ${siteConfig.name}`,
  description: "Confira as atividades recentes da AMPLA",
}

export default function AtividadesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
