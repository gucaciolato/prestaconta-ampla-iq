import { NextResponse } from "next/server"
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi"
import { createDocument } from "@asteasolutions/zod-to-openapi"
import { z } from "zod"

export async function GET() {
  const registry = new OpenAPIRegistry()

  // Definir o documento base
  registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  })

  // Definir schemas comuns
  const ErrorResponse = registry.register(
    "ErrorResponse",
    z.object({
      error: z.string().describe("Mensagem de erro"),
      details: z.string().optional().describe("Detalhes adicionais sobre o erro"),
    }),
  )

  const SuccessResponse = registry.register(
    "SuccessResponse",
    z.object({
      success: z.boolean().describe("Indica se a operação foi bem-sucedida"),
      message: z.string().optional().describe("Mensagem de sucesso"),
    }),
  )

  // Definir rotas de autenticação
  registry.registerPath({
    method: "post",
    path: "/api/auth/login",
    summary: "Login de usuário",
    description: "Autentica um usuário e retorna um token JWT",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              username: z.string().describe("Nome de usuário"),
              password: z.string().describe("Senha do usuário"),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Login bem-sucedido",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              token: z.string().describe("Token JWT para autenticação"),
              user: z.object({
                _id: z.string(),
                username: z.string(),
                nome: z.string(),
                email: z.string().optional(),
                role: z.string(),
              }),
            }),
          },
        },
      },
      401: {
        description: "Credenciais inválidas",
        content: {
          "application/json": {
            schema: ErrorResponse,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: "get",
    path: "/api/auth/me",
    summary: "Obter usuário atual",
    description: "Retorna informações do usuário autenticado",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Informações do usuário",
        content: {
          "application/json": {
            schema: z.object({
              _id: z.string(),
              username: z.string(),
              nome: z.string(),
              email: z.string().optional(),
              role: z.string(),
            }),
          },
        },
      },
      401: {
        description: "Não autenticado",
        content: {
          "application/json": {
            schema: ErrorResponse,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: "post",
    path: "/api/auth/logout",
    summary: "Logout de usuário",
    description: "Encerra a sessão do usuário",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Logout bem-sucedido",
        content: {
          "application/json": {
            schema: SuccessResponse,
          },
        },
      },
    },
  })

  // Definir rotas de documentos
  registry.registerPath({
    method: "get",
    path: "/api/documentos",
    summary: "Listar documentos",
    description: "Retorna uma lista de documentos com filtros opcionais",
    security: [{ bearerAuth: [] }],
    request: {
      query: z.object({
        tipo: z.string().optional().describe("Tipo de documento (ex: relatorio, livro)"),
        ano: z.string().optional().describe("Ano do documento"),
        mes: z.string().optional().describe("Mês do documento (1-12)"),
        categoria: z.string().optional().describe("Categoria do documento"),
      }),
    },
    responses: {
      200: {
        description: "Lista de documentos",
        content: {
          "application/json": {
            schema: z.array(
              z.object({
                _id: z.string(),
                titulo: z.string(),
                tipo: z.string(),
                ano: z.string().optional(),
                mes: z.string().optional(),
                categoria: z.string().optional(),
                url: z.string(),
                createdAt: z.string().optional(),
                updatedAt: z.string().optional(),
              }),
            ),
          },
        },
      },
      500: {
        description: "Erro interno",
        content: {
          "application/json": {
            schema: ErrorResponse,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: "post",
    path: "/api/documentos",
    summary: "Criar documento",
    description: "Cria um novo documento",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              titulo: z.string().describe("Título do documento"),
              tipo: z.string().describe("Tipo de documento"),
              ano: z.string().optional().describe("Ano do documento"),
              mes: z.string().optional().describe("Mês do documento (1-12)"),
              categoria: z.string().optional().describe("Categoria do documento"),
              url: z.string().describe("URL do arquivo"),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Documento criado",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              documento: z.object({
                _id: z.string(),
                titulo: z.string(),
                tipo: z.string(),
                ano: z.string().optional(),
                mes: z.string().optional(),
                categoria: z.string().optional(),
                url: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      400: {
        description: "Dados inválidos",
        content: {
          "application/json": {
            schema: ErrorResponse,
          },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": {
            schema: ErrorResponse,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: "get",
    path: "/api/documentos/{id}",
    summary: "Obter documento",
    description: "Retorna um documento específico pelo ID",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().describe("ID do documento"),
      }),
    },
    responses: {
      200: {
        description: "Documento encontrado",
        content: {
          "application/json": {
            schema: z.object({
              _id: z.string(),
              titulo: z.string(),
              tipo: z.string(),
              ano: z.string().optional(),
              mes: z.string().optional(),
              categoria: z.string().optional(),
              url: z.string(),
              createdAt: z.string().optional(),
              updatedAt: z.string().optional(),
            }),
          },
        },
      },
      404: {
        description: "Documento não encontrado",
        content: {
          "application/json": {
            schema: ErrorResponse,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: "put",
    path: "/api/documentos/{id}",
    summary: "Atualizar documento",
    description: "Atualiza um documento existente",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().describe("ID do documento"),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              titulo: z.string().optional().describe("Título do documento"),
              tipo: z.string().optional().describe("Tipo de documento"),
              ano: z.string().optional().describe("Ano do documento"),
              mes: z.string().optional().describe("Mês do documento (1-12)"),
              categoria: z.string().optional().describe("Categoria do documento"),
              url: z.string().optional().describe("URL do arquivo"),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Documento atualizado",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              documento: z.object({
                _id: z.string(),
                titulo: z.string(),
                tipo: z.string(),
                ano: z.string().optional(),
                mes: z.string().optional(),
                categoria: z.string().optional(),
                url: z.string(),
                updatedAt: z.string(),
              }),
            }),
          },
        },
      },
      404: {
        description: "Documento não encontrado",
        content: {
          "application/json": {
            schema: ErrorResponse,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: "delete",
    path: "/api/documentos/{id}",
    summary: "Excluir documento",
    description: "Exclui um documento existente",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().describe("ID do documento"),
      }),
    },
    responses: {
      200: {
        description: "Documento excluído",
        content: {
          "application/json": {
            schema: SuccessResponse,
          },
        },
      },
      404: {
        description: "Documento não encontrado",
        content: {
          "application/json": {
            schema: ErrorResponse,
          },
        },
      },
    },
  })

  // Definir rotas de upload e arquivos
  registry.registerPath({
    method: "post",
    path: "/api/upload",
    summary: "Upload de arquivo",
    description: "Faz upload de um arquivo para o sistema",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "multipart/form-data": {
            schema: z.object({
              file: z.any().describe("Arquivo a ser enviado"),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Upload bem-sucedido",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              fileId: z.string().describe("ID do arquivo no GridFS"),
              fileUrl: z.string().describe("URL para acessar o arquivo"),
              fileName: z.string().describe("Nome original do arquivo"),
              contentType: z.string().describe("Tipo MIME do arquivo"),
            }),
          },
        },
      },
      400: {
        description: "Requisição inválida",
        content: {
          "application/json": {
            schema: ErrorResponse,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: "get",
    path: "/api/files/{fileId}",
    summary: "Obter arquivo",
    description: "Retorna um arquivo armazenado no GridFS",
    request: {
      params: z.object({
        fileId: z.string().describe("ID do arquivo no GridFS"),
      }),
    },
    responses: {
      200: {
        description: "Arquivo encontrado",
        content: {
          "application/octet-stream": {
            schema: z.any().describe("Conteúdo do arquivo"),
          },
        },
      },
      400: {
        description: "ID de arquivo inválido",
        content: {
          "application/json": {
            schema: ErrorResponse,
          },
        },
      },
      404: {
        description: "Arquivo não encontrado",
        content: {
          "application/json": {
            schema: ErrorResponse,
          },
        },
      },
    },
  })

  // Definir rotas de diretoria
  registry.registerPath({
    method: "get",
    path: "/api/diretoria",
    summary: "Listar membros da diretoria",
    description: "Retorna a lista de membros da diretoria",
    responses: {
      200: {
        description: "Lista de membros",
        content: {
          "application/json": {
            schema: z.array(
              z.object({
                _id: z.string(),
                nome: z.string(),
                cargo: z.string(),
                foto: z.string().optional(),
                email: z.string().optional(),
                telefone: z.string().optional(),
                bio: z.string().optional(),
              }),
            ),
          },
        },
      },
    },
  })

  // Definir rotas de galeria
  registry.registerPath({
    method: "get",
    path: "/api/galeria",
    summary: "Listar itens da galeria",
    description: "Retorna a lista de itens da galeria",
    responses: {
      200: {
        description: "Lista de itens",
        content: {
          "application/json": {
            schema: z.array(
              z.object({
                _id: z.string(),
                titulo: z.string(),
                descricao: z.string().optional(),
                imagem: z.string(),
                data: z.string().optional(),
                categoria: z.string().optional(),
              }),
            ),
          },
        },
      },
    },
  })

  // Definir rotas de avisos
  registry.registerPath({
    method: "get",
    path: "/api/avisos",
    summary: "Listar avisos",
    description: "Retorna a lista de avisos",
    responses: {
      200: {
        description: "Lista de avisos",
        content: {
          "application/json": {
            schema: z.array(
              z.object({
                _id: z.string(),
                titulo: z.string(),
                conteudo: z.string(),
                data: z.string(),
                autor: z.string().optional(),
                importante: z.boolean().optional(),
              }),
            ),
          },
        },
      },
    },
  })

  // Definir rotas de financeiro
  registry.registerPath({
    method: "get",
    path: "/api/financeiro",
    summary: "Listar registros financeiros",
    description: "Retorna a lista de registros financeiros",
    security: [{ bearerAuth: [] }],
    request: {
      query: z.object({
        ano: z.string().optional().describe("Ano do registro financeiro"),
        mes: z.string().optional().describe("Mês do registro financeiro (1-12)"),
        tipo: z.string().optional().describe("Tipo de registro (receita/despesa)"),
      }),
    },
    responses: {
      200: {
        description: "Lista de registros financeiros",
        content: {
          "application/json": {
            schema: z.array(
              z.object({
                _id: z.string(),
                descricao: z.string(),
                valor: z.number(),
                data: z.string(),
                tipo: z.string(),
                categoria: z.string().optional(),
                comprovante: z.string().optional(),
              }),
            ),
          },
        },
      },
      401: {
        description: "Não autorizado",
        content: {
          "application/json": {
            schema: ErrorResponse,
          },
        },
      },
    },
  })

  // Gerar o documento OpenAPI
  const openApiDocument = createDocument(
    {
      openapi: "3.0.0",
      info: {
        title: "API PrestaConta",
        version: "1.0.0",
        description: "Documentação da API do sistema PrestaConta",
        contact: {
          name: "Suporte PrestaConta",
          email: "suporte@prestaconta.com.br",
        },
      },
      servers: [
        {
          url: "https://ampla.prestaconta.com.br",
          description: "Servidor de produção",
        },
      ],
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    registry.definitions,
  )

  return NextResponse.json(openApiDocument)
}
