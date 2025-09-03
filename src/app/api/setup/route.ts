import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verificar se já foi configurado
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Sistema já configurado', configured: true },
        { status: 200 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { 
          message: 'ADMIN_EMAIL e ADMIN_PASSWORD não configurados nas variáveis de ambiente',
          configured: false 
        },
        { status: 400 }
      );
    }

    // Criar usuário administrador
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrador',
        password: hashedPassword,
        role: 'admin',
        active: true
      }
    });

    // Criar serviços básicos se não existirem
    const servicesCount = await prisma.service.count();
    
    if (servicesCount === 0) {
      const basicServices = [
        {
          name: 'Consulta de Avaliação',
          slug: 'consulta-avaliacao',
          durationMin: 30,
          description: 'Consulta inicial para avaliação do paciente',
          priceCents: 0,
          active: true
        },
        {
          name: 'Limpeza Dental',
          slug: 'limpeza-dental',
          durationMin: 60,
          description: 'Limpeza e profilaxia dental',
          priceCents: 0,
          active: true
        },
        {
          name: 'Restauração',
          slug: 'restauracao',
          durationMin: 90,
          description: 'Restauração de dente cariado',
          priceCents: 0,
          active: true
        }
      ];

      for (const service of basicServices) {
        await prisma.service.create({
          data: service
        });
      }
    }

    // Criar informações da clínica se não existirem
    const clinicInfo = await prisma.clinicInfo.findUnique({
      where: { id: 'singleton' }
    });

    if (!clinicInfo) {
      await prisma.clinicInfo.create({
        data: {
          id: 'singleton',
          name: 'Odonto Center',
          slogan: 'Seu sorriso é nossa prioridade',
          address: 'Endereço da clínica',
          cityState: 'Cidade - Estado',
          phone: '(11) 99999-9999',
          whatsapp: '5511999999999',
          email: 'contato@odontocenter.com',
          highlights: 'Clínica odontológica moderna com profissionais qualificados'
        }
      });
    }

    return NextResponse.json(
      { 
        message: 'Sistema configurado com sucesso!',
        configured: true,
        adminEmail 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro na configuração:', error);
    return NextResponse.json(
      { 
        message: 'Erro na configuração do sistema',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        configured: false 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const adminExists = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    return NextResponse.json({
      configured: !!adminExists,
      message: adminExists ? 'Sistema já configurado' : 'Sistema não configurado'
    });

  } catch (error) {
    return NextResponse.json(
      { 
        configured: false,
        message: 'Erro ao verificar configuração',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
