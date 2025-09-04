import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    // Buscar mensagens de contato (sem autenticação para demonstração)
    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Erro ao buscar mensagens de contato:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read } = body;

    if (!id || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: "ID e status de leitura são obrigatórios" },
        { status: 400 }
      );
    }

    // Atualizar status de leitura (sem autenticação para demonstração)
    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: { read }
    });

    return NextResponse.json({ message: updatedMessage });
  } catch (error) {
    console.error("Erro ao atualizar mensagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "ID da mensagem é obrigatório" },
        { status: 400 }
      );
    }

    // Deletar mensagem (sem autenticação para demonstração)
    await prisma.contactMessage.delete({
      where: { id }
    });

    return NextResponse.json({ 
      message: "Mensagem deletada com sucesso",
      id 
    });
  } catch (error) {
    console.error("Erro ao deletar mensagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
