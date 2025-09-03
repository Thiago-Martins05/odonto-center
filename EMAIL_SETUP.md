# Configuração de Email para Formulário de Contato

## Status Atual

✅ **Formulário de contato funcionando!** 

O formulário está funcionando corretamente. Quando não há configuração de email, as mensagens são processadas e logadas no console do servidor.

## Como Configurar Envio de Email

### 1. Criar conta no Resend

1. Acesse [https://resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Verifique seu domínio ou use o domínio de teste

### 2. Obter API Key

1. No dashboard do Resend, vá em "API Keys"
2. Crie uma nova API key
3. Copie a chave (formato: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 3. Configurar no Projeto

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione a seguinte linha:

```bash
RESEND_API_KEY="sua_api_key_aqui"
```

### 4. Configurar Email do Administrador

No arquivo `.env.local`, também adicione:

```bash
ADMIN_EMAIL="seu-email@exemplo.com"
```

### 5. Reiniciar o Servidor

```bash
npm run dev
```

## Como Funciona

- **Com email configurado**: Mensagens são enviadas por email para o administrador
- **Sem email configurado**: Mensagens são processadas e logadas no console
- **Sempre**: O formulário retorna sucesso para o usuário

## Testando

Use o script de teste:

```bash
node test-contact-form.js
```

## Logs

Verifique os logs do servidor para ver as mensagens processadas:

- **Email enviado**: "Email enviado com sucesso para o administrador"
- **Email não configurado**: "Email não enviado (serviço não configurado), mas mensagem processada"

## Próximos Passos

1. Configure o Resend para envio de emails
2. Teste o envio real
3. Configure notificações no painel administrativo (quando o banco de dados estiver funcionando)
