import type React from "react"
import { generateMetadata } from "@/lib/metadata"

export const metadata = generateMetadata({
  title: "Relatórios de Atividade",
  description: "Confira os relatórios de atividades da AMPLA",
})

export default function RelatoriosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
