import type React from "react"
import { generateMetadata } from "@/lib/metadata"

export const metadata = generateMetadata({
  title: "Login",
  description: "Acesse o painel administrativo do PrestaConta",
})

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
