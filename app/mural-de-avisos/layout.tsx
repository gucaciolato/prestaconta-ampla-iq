import type React from "react"
import { generateMetadata } from "@/lib/metadata"

export const metadata = generateMetadata({
  title: "Mural de Avisos",
  description: "Confira os avisos e comunicados da AMPLA",
})

export default function MuralAvisosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
