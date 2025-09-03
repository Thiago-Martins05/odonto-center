import { NextRequest, NextResponse } from "next/server";

// Mock de mensagens para demonstração
const mockMessages = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@example.com",
    phone: "(11) 99999-9999",
    subject: "Consulta sobre tratamento",
    message: "Gostaria de agendar uma consulta para avaliação. Tenho algumas dúvidas sobre o tratamento ortodôntico.",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
  },
  {
    id: "2", 
    name: "Maria Santos",
    email: "maria@example.com",
    phone: "(11) 88888-8888",
    subject: "Dúvida sobre preços",
    message: "Olá! Gostaria de saber os valores dos tratamentos de limpeza e clareamento dental.",
    read: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@example.com",
    subject: "Agendamento urgente",
    message: "Preciso de um agendamento urgente para esta semana. Tenho uma dor de dente que está me incomodando muito.",
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
  }
];

export async function GET(request: NextRequest) {
  try {
    // Para demonstração, não verificar autenticação
    // Em produção, sempre verificar autenticação
    
    // Retornar mensagens mock
    return NextResponse.json({ 
      messages: mockMessages,
      note: "Estas são mensagens de demonstração. Configure o banco de dados para ver mensagens reais."
    });
  } catch (error) {
    console.error("Erro ao buscar mensagens mock:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Para demonstração, não verificar autenticação
    // Em produção, sempre verificar autenticação

    const body = await request.json();
    const { id, read } = body;

    if (!id || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: "ID e status de leitura são obrigatórios" },
        { status: 400 }
      );
    }

    // Simular atualização (em produção, isso seria salvo no banco)
    const messageIndex = mockMessages.findIndex(msg => msg.id === id);
    if (messageIndex !== -1) {
      mockMessages[messageIndex].read = read;
    }

    return NextResponse.json({ 
      message: mockMessages[messageIndex],
      note: "Status atualizado (modo demonstração)"
    });
  } catch (error) {
    console.error("Erro ao atualizar mensagem mock:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
