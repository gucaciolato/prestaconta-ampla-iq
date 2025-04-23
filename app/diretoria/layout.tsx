import type React from "react"
import { generateMetadata } from "@/lib/metadata"

export const metadata = generateMetadata({
  title: "Quadro de Diretoria",
  description: "Conheça os membros da diretoria e conselho fiscal da AMPLA",
})

export default function DiretoriaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
