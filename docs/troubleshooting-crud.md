# Guia de Solução de Problemas para Operações CRUD

Este guia ajudará a identificar e resolver problemas com operações CRUD (Create, Read, Update, Delete) no sistema.

## 1. Verificar Conexão com o Banco de Dados

Primeiro, verifique se a conexão com o banco de dados está funcionando:

\`\`\`bash
curl https://seu-site.com/api/test-db-connection
\`\`\`

A resposta deve mostrar uma conexão bem-sucedida e listar as coleções disponíveis.

## 2. Testar Operações CRUD Básicas

### Listar dados (GET)
\`\`\`bash
curl https://seu-site.com/api/test-crud?collection=avisos
\`\`\`

### Inserir dados (POST)
\`\`\`bash
curl -X POST https://seu-site.com/api/test-crud \
  -H "Content-Type: application/json" \
  -d '{"collection":"avisos_teste","document":{"titulo":"Teste","conteudo":"Conteúdo de teste"}}'
\`\`\`

### Atualizar dados (PUT)
\`\`\`bash
curl -X PUT https://seu-site.com/api/test-crud \
  -H "Content-Type: application/json" \
  -d '{"collection":"avisos_teste","id":"ID_DO_DOCUMENTO","update":{"titulo":"Atualizado"}}'
\`\`\`

### Excluir dados (DELETE)
\`\`\`bash
curl -X DELETE https://seu-site.com/api/test-crud?collection=avisos_teste&id=ID_DO_DOCUMENTO
\`\`\`

## 3. Verificar Logs e Erros Comuns

### Problemas de Conexão
- URI de MongoDB incorreta
- Credenciais inválidas
- Firewall bloqueando a conexão

### Problemas de Autorização
- Permissões insuficientes no banco de dados
- Usuário sem acesso à coleção específica

### Problemas de Dados
- IDs inválidos (formato incorreto)
- Dados em formato incompatível
- Esquema/validação rejeitando os dados

## 4. Verificar o Cliente Frontend

- Abra o console do navegador (F12) para ver erros de JavaScript
- Verifique se os dados estão sendo enviados corretamente nas requisições
- Verifique se há erros nas respostas das APIs

## 5. Depuração Avançada

Para uma depuração mais detalhada, execute o script de teste CRUD:

\`\`\`bash
npx ts-node scripts/run-test-crud.ts
\`\`\`

Este script testará todas as operações CRUD diretamente contra o banco de dados.

## 6. Limpar os Cookies e Cache do Navegador

Às vezes, problemas no frontend podem ser resolvidos limpando o cache:

1. Abra as configurações do navegador
2. Vá para "Privacidade e segurança"
3. Clique em "Limpar dados de navegação"
4. Selecione "Cookies" e "Cache" e limpe

## 7. Contato para Suporte

Se os problemas persistirem, entre em contato com o suporte técnico fornecendo:
- Descrição detalhada do problema
- Capturas de tela do erro
- Logs do console do navegador
- Detalhes da operação que está falhando
