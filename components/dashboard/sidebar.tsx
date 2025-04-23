"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/lib/auth-provider"
import { useSidebar } from "@/contexts/sidebar-context"
import {
  LayoutDashboard,
  Megaphone,
  DollarSign,
  ImageIcon,
  FileText,
  CalendarDays,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  UserCog,
  User,
} from "lucide-react"
import Image from "next/image"

export function Sidebar() {
  const pathname = usePathname()
  const { logout, hasPermission, user } = useAuth()
  const { isOpen, setIsOpen, isMobile } = useSidebar()

  // Definir itens do sidebar com base nas permissões
  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      permission: "dashboard",
    },
    {
      title: "Mural de Avisos",
      href: "/dashboard/mural-de-avisos",
      icon: Megaphone,
      permission: "muralAvisos",
    },
    {
      title: "Receitas e Despesas",
      href: "/dashboard/financeiro",
      icon: DollarSign,
      permission: "financeiro",
    },
    {
      title: "Galeria de Fotos",
      href: "/dashboard/galeria",
      icon: ImageIcon,
      permission: "galeria",
    },
    {
      title: "Livros Contábeis",
      href: "/dashboard/livros-contabeis",
      icon: FileText,
      permission: "livrosContabeis",
    },
    {
      title: "Relatórios",
      href: "/dashboard/relatorios",
      icon: CalendarDays,
      permission: "relatorios",
    },
    {
      title: "Diretoria",
      href: "/dashboard/diretoria",
      icon: Users,
      permission: "diretoria",
    },
    {
      title: "Usuários",
      href: "/dashboard/usuarios",
      icon: UserCog,
      permission: "usuarios",
    },
  ]

  // Filtrar itens com base nas permissões
  const filteredItems = sidebarItems.filter((item) => hasPermission(item.permission as any))

  return (
    <>
      {/* Mobile sidebar toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Desktop sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 hidden lg:flex"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-0 lg:w-16",
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn("p-4 border-b", !isOpen && "lg:p-2")}>
            <Link href="/" className={cn("flex items-center", !isOpen && "lg:justify-center")}>
              {isOpen ? (
                <Image src="/presta-conta-logo.svg" alt="PrestaConta Logo" width={150} height={40} />
              ) : (
                <div className="hidden lg:block">
                  <Image src="/favicon.svg" alt="PrestaConta Icon" width={24} height={24} />
                </div>
              )}
            </Link>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className={cn("space-y-1", isOpen ? "px-2" : "px-0")}>
              {filteredItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => isMobile && setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      isOpen ? "w-full justify-start" : "lg:w-full lg:justify-center lg:px-0",
                      pathname === item.href && "bg-gray-100",
                      !isOpen && "hidden lg:flex",
                    )}
                    title={!isOpen ? item.title : undefined}
                  >
                    <item.icon className={cn("h-5 w-5", isOpen && "mr-2")} />
                    {isOpen && <span>{item.title}</span>}
                  </Button>
                </Link>
              ))}
            </nav>
          </ScrollArea>

          <div className={cn("p-4 border-t", !isOpen && "lg:p-2")}>
            {/* Informações do usuário */}
            {isOpen && user && (
              <div className="mb-4 px-2 py-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-2" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.nome}</p>
                    <p className="text-xs text-gray-500 truncate">{user.username}</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              className={cn(
                isOpen
                  ? "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  : "lg:w-full lg:justify-center lg:px-0 text-red-500",
                !isOpen && "hidden lg:flex",
              )}
              onClick={() => {
                isMobile && setIsOpen(false)
                logout()
              }}
              title={!isOpen ? "Sair" : undefined}
            >
              <LogOut className={cn("h-5 w-5", isOpen && "mr-2")} />
              {isOpen && <span>Sair</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
