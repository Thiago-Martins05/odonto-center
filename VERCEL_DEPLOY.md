# Deploy na Vercel - Odonto Center

Este documento explica como fazer o deploy do projeto Odonto Center na Vercel.

## Pré-requisitos

1. Conta na Vercel (gratuita)
2. Projeto no GitHub/GitLab/Bitbucket
3. Chave API do Resend (para emails)

## Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que todos os arquivos estão commitados e enviados para o repositório:

```bash
git add .
git commit -m "Configure project for Vercel deployment"
git push origin main
```

### 2. Conectar Projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe seu repositório do GitHub/GitLab/Bitbucket
4. Selecione o projeto "odonto-center"

### 3. Configurar Variáveis de Ambiente

Na Vercel, vá em Settings > Environment Variables e adicione:

#### Obrigatórias:
- `DATABASE_URL`: URL do banco PostgreSQL (será configurada automaticamente se usar Vercel Postgres)
- `NEXTAUTH_URL`: URL da aplicação (ex: https://seu-projeto.vercel.app)
- `NEXTAUTH_SECRET`: Chave secreta para NextAuth (gere uma chave forte)
- `RESEND_API_KEY`: Sua chave API do Resend
- `ADMIN_EMAIL`: Email do administrador
- `ADMIN_PASSWORD`: Senha do administrador

#### Como gerar NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Configurar Banco de Dados

#### Opção A: Vercel Postgres (Recomendado)
1. Na Vercel, vá em Storage
2. Clique em "Create Database" > "Postgres"
3. Escolha um nome para o banco
4. A variável `DATABASE_URL` será configurada automaticamente

#### Opção B: Banco Externo
Use um serviço como:
- Supabase (gratuito)
- PlanetScale (gratuito)
- Railway (gratuito)
- Neon (gratuito)

### 5. Configurar Build Settings

A Vercel detectará automaticamente que é um projeto Next.js. As configurações no `vercel.json` já estão otimizadas.

### 6. Fazer Deploy

1. Clique em "Deploy"
2. Aguarde o build completar
3. Após o deploy, acesse a URL fornecida

### 7. Configurar Banco de Dados (Primeira vez)

Após o primeiro deploy, você precisa executar as migrações:

1. Acesse o dashboard da Vercel
2. Vá em Functions > Edge Functions
3. Ou use o Vercel CLI:

```bash
npx vercel env pull .env.local
npx prisma migrate deploy
```

### 8. Criar Usuário Administrador

Após o deploy, acesse: `https://seu-projeto.vercel.app/api/test` para criar o usuário admin automaticamente.

## Comandos Úteis

### Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Ver logs
vercel logs

# Configurar variáveis de ambiente
vercel env add DATABASE_URL
```

### Prisma (Produção)
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# Ver banco de dados
npx prisma studio
```

## Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme se as variáveis de ambiente estão configuradas
- Verifique os logs de build na Vercel

### Erro de Banco de Dados
- Confirme se a `DATABASE_URL` está correta
- Execute `npx prisma migrate deploy` após o deploy
- Verifique se o banco PostgreSQL está acessível

### Erro de Autenticação
- Confirme se `NEXTAUTH_URL` está correto (com https://)
- Verifique se `NEXTAUTH_SECRET` está configurado
- Teste o login após o deploy

## Monitoramento

- Use o dashboard da Vercel para monitorar performance
- Configure alertas para erros
- Monitore o uso do banco de dados

## Atualizações

Para atualizar o projeto:
1. Faça as alterações no código
2. Commit e push para o repositório
3. A Vercel fará deploy automático

## Suporte

- [Documentação Vercel](https://vercel.com/docs)
- [Next.js na Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Prisma na Vercel](https://vercel.com/docs/integrations/prisma)

