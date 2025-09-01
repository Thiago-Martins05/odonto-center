# Configuração do Sistema Administrativo

## Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Database
DATABASE_URL="file:./dev.db"
```

**IMPORTANTE**: Em produção, altere o `NEXTAUTH_SECRET` para uma chave segura e única.

### 2. Usuário Administrador Padrão

O sistema já foi configurado com um usuário administrador padrão:

- **Email**: admin@odontocenter.com
- **Senha**: admin123
- **Role**: admin

**⚠️ ATENÇÃO**: Esta é uma senha padrão para desenvolvimento.
**ALTERE IMEDIATAMENTE** em ambiente de produção!

### 3. Como Acessar

1. Acesse `/login` no seu site
2. Use as credenciais do usuário administrador
3. Após o login, você será redirecionado para `/admin`

### 4. Segurança

- Apenas usuários com role "admin" podem acessar a área administrativa
- Todas as rotas `/admin/*` são protegidas por middleware
- Sessões são gerenciadas via JWT
- Senhas são criptografadas com bcrypt

### 5. Comandos Úteis

```bash
# Atualizar banco de dados
npm run db:push

# Executar seed (criar usuário admin)
npm run db:seed

# Abrir Prisma Studio
npm run db:studio

# Desenvolver
npm run dev
```

### 6. Estrutura do Sistema

- **Autenticação**: NextAuth.js com Credentials Provider
- **Banco de Dados**: Prisma com SQLite
- **Proteção**: Middleware para rotas administrativas
- **Criptografia**: bcryptjs para senhas
- **Sessões**: JWT strategy

### 7. Personalização

Para adicionar novos usuários administradores:

1. Acesse o banco de dados via Prisma Studio: `npm run db:studio`
2. Ou crie um script de seed personalizado
3. Ou use a API do Prisma para criar usuários programaticamente

### 8. Troubleshooting

Se encontrar problemas:

1. Verifique se as variáveis de ambiente estão configuradas
2. Execute `npm run db:push` para sincronizar o banco
3. Verifique se o usuário admin foi criado: `npm run db:seed`
4. Limpe o cache do navegador e tente novamente

