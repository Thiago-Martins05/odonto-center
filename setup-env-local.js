#!/usr/bin/env node

/**
 * Script para configurar o ambiente local
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Database
# Para desenvolvimento local (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Email (Resend) - Opcional
# RESEND_API_KEY="your-resend-api-key"

# Admin User (para criação automática)
ADMIN_EMAIL="admin@odontocenter.com"
ADMIN_PASSWORD="admin123"

# Configurações opcionais
NODE_ENV="development"
`;

try {
  const envPath = path.join(__dirname, '.env.local');
  
  // Verificar se o arquivo já existe
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Arquivo .env.local já existe');
    console.log('📄 Conteúdo atual:');
    console.log(fs.readFileSync(envPath, 'utf8'));
    return;
  }
  
  // Criar o arquivo .env.local
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Arquivo .env.local criado com sucesso!');
  console.log('📄 Conteúdo:');
  console.log(envContent);
  console.log('');
  console.log('🚀 Agora você pode executar:');
  console.log('   npm run fix:production');
  
} catch (error) {
  console.error('❌ Erro ao criar .env.local:', error.message);
  console.log('');
  console.log('📝 Crie manualmente o arquivo .env.local com o seguinte conteúdo:');
  console.log('');
  console.log(envContent);
}

