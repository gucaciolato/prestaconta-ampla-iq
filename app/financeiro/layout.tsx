import type React from "react"
import { generateMetadata } from "@/lib/metadata"

export const metadata = generateMetadata({
  title: "Receitas e Despesas",
  description: "Transparência financeira da AMPLA - Receitas e Despesas",
})

export default function FinanceiroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
