# 🚀 Deploy na Vercel - Guia Rápido

## ✅ Configuração Completa

O projeto já está **100% configurado** para deploy na Vercel! Todos os arquivos necessários foram criados e configurados.

## 📋 Checklist de Deploy

### 1. Preparar Repositório
```bash
git add .
git commit -m "Configure project for Vercel deployment"
git push origin main
```

### 2. Deploy na Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe seu repositório
4. Configure as variáveis de ambiente (veja abaixo)
5. Clique em "Deploy"

### 3. Variáveis de Ambiente Obrigatórias
Configure estas variáveis na Vercel (Settings > Environment Variables):

```
DATABASE_URL=postgresql://... (configurado automaticamente com Vercel Postgres)
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=sua-chave-secreta-aqui
RESEND_API_KEY=sua-chave-resend
ADMIN_EMAIL=admin@exemplo.com
ADMIN_PASSWORD=senha-segura
```

### 4. Configuração Inicial
Após o deploy, acesse: `https://seu-projeto.vercel.app/api/setup`

Isso criará automaticamente:
- ✅ Usuário administrador
- ✅ Serviços básicos
- ✅ Informações da clínica

## 🎯 URLs Importantes

- **Site**: `https://seu-projeto.vercel.app`
- **Admin**: `https://seu-projeto.vercel.app/admin`
- **Setup**: `https://seu-projeto.vercel.app/api/setup`

## 📁 Arquivos Criados

- `vercel.json` - Configurações do Vercel
- `env.example` - Exemplo de variáveis de ambiente
- `.vercelignore` - Arquivos ignorados no deploy
- `VERCEL_DEPLOY.md` - Documentação completa
- `scripts/setup-production.js` - Script de configuração
- `src/app/api/setup/route.ts` - API de configuração inicial

## 🔧 Comandos Úteis

```bash
# Deploy local
vercel

# Ver logs
vercel logs

# Configurar variáveis
vercel env add NEXTAUTH_SECRET
```

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs na Vercel
2. Confirme se todas as variáveis estão configuradas
3. Teste a API de setup: `/api/setup`

**Tudo está pronto para o deploy! 🎉**

