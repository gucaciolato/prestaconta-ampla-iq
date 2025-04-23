export type UserRole =
  | "admin"
  | "presidente"
  | "vice-presidente"
  | "tesoureiro"
  | "1-tesoureiro"
  | "2-tesoureiro"
  | "secretario"
  | "1-secretario"
  | "2-secretario"
  | "membro"

export interface User {
  id: string
  username: string
  password: string // Será armazenada com hash
  nome: string
  email?: string
  role: UserRole
  ativo: boolean
  dataCriacao: Date
  ultimoAcesso?: Date
}

export interface Permission {
  dashboard: boolean
  muralAvisos: boolean
  financeiro: boolean
  galeria: boolean
  livrosContabeis: boolean
  relatorios: boolean
  diretoria: boolean
  atividades: boolean
  usuarios: boolean
}

export const rolePermissions: Record<UserRole, Permission> = {
  admin: {
    dashboard: true,
    muralAvisos: true,
    financeiro: true,
    galeria: true,
    livrosContabeis: true,
    relatorios: true,
    diretoria: true,
    atividades: true,
    usuarios: true,
  },
  presidente: {
    dashboard: true,
    muralAvisos: true,
    financeiro: true,
    galeria: true,
    livrosContabeis: true,
    relatorios: true,
    diretoria: true,
    atividades: true,
    usuarios: true,
  },
  "vice-presidente": {
    dashboard: true,
    muralAvisos: true,
    financeiro: true,
    galeria: true,
    livrosContabeis: true,
    relatorios: true,
    diretoria: true,
    atividades: true,
    usuarios: true,
  },
  "1-tesoureiro": {
    dashboard: true,
    muralAvisos: false,
    financeiro: true,
    galeria: false,
    livrosContabeis: true,
    relatorios: false,
    diretoria: false,
    atividades: false,
    usuarios: false,
  },
  "2-tesoureiro": {
    dashboard: true,
    muralAvisos: false,
    financeiro: true,
    galeria: false,
    livrosContabeis: true,
    relatorios: false,
    diretoria: false,
    atividades: false,
    usuarios: false,
  },
  tesoureiro: {
    dashboard: true,
    muralAvisos: false,
    financeiro: true,
    galeria: false,
    livrosContabeis: true,
    relatorios: false,
    diretoria: false,
    atividades: false,
    usuarios: false,
  },
  "1-secretario": {
    dashboard: true,
    muralAvisos: true,
    financeiro: false,
    galeria: true,
    livrosContabeis: false,
    relatorios: true,
    diretoria: false,
    atividades: true,
    usuarios: false,
  },
  "2-secretario": {
    dashboard: true,
    muralAvisos: true,
    financeiro: false,
    galeria: true,
    livrosContabeis: false,
    relatorios: true,
    diretoria: false,
    atividades: true,
    usuarios: false,
  },
  secretario: {
    dashboard: true,
    muralAvisos: true,
    financeiro: false,
    galeria: true,
    livrosContabeis: false,
    relatorios: true,
    diretoria: false,
    atividades: true,
    usuarios: false,
  },
  membro: {
    dashboard: true,
    muralAvisos: false,
    financeiro: false,
    galeria: false,
    livrosContabeis: false,
    relatorios: false,
    diretoria: false,
    atividades: false,
    usuarios: false,
  },
}

export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  return rolePermissions[role][permission]
}
