import type React from "react"
import { generateMetadata } from "@/lib/metadata"

import DashboardLayoutClient from "./DashboardLayoutClient"

export const metadata = generateMetadata({
  title: "Dashboard",
  description: "Painel administrativo do PrestaConta",
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutClient children={children} />
}
