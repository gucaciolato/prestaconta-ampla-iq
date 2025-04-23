import type React from "react"
import { generateMetadata } from "@/lib/metadata"

export const metadata = generateMetadata({
  title: "Galeria de Fotos",
  description: "Confira as fotos dos eventos e atividades da AMPLA",
})

export default function GaleriaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
