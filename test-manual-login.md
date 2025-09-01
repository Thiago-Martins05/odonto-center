# Teste Manual do Login de Administrador

## Credenciais de Teste

- **Email**: admin@odontocenter.com
- **Senha**: admin123

## Passos para Testar

1. **Acesse a página de login**:

   ```
   http://localhost:3000/login
   ```

2. **Preencha as credenciais**:

   - Email: admin@odontocenter.com
   - Senha: admin123

3. **Clique em "Entrar"**

4. **Verifique o resultado**:
   - ✅ **Sucesso**: Você será redirecionado para `/admin`
   - ❌ **Falha**: Você permanecerá na página de login com uma mensagem de erro

## Verificações Adicionais

### Se o login falhar, verifique:

1. **Banco de dados**:

   ```bash
   node check-admin.js
   ```

2. **Autenticação local**:

   ```bash
   node test-simple-auth.js
   ```

3. **API de autenticação**:
   ```bash
   node test-callback-route.js
   ```

## Problemas Comuns

### Erro 500 na API

- Verifique se o arquivo `.env.local` está configurado corretamente
- Verifique se o banco de dados está acessível
- Verifique os logs do servidor

### Credenciais inválidas

- Verifique se o usuário admin foi criado no banco
- Execute: `npm run db:seed`

### Página não carrega

- Verifique se o servidor está rodando: `npm run dev`
- Verifique se a porta 3000 está livre
