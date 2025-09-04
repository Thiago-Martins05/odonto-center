import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar mensagens de contato
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
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { id, read } = body;

    if (!id || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: "ID e status de leitura são obrigatórios" },
        { status: 400 }
      );
    }

    // Atualizar status de leitura
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
