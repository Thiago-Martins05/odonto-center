import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/server/email";
import { prisma } from "@/server/db";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validação básica
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Salvar mensagem no banco de dados
    const savedMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        message: `${subject}\n\n${message}`, // Combinar assunto e mensagem
      },
    });

    // Tentar enviar email para o administrador
    const emailResult = await sendContactEmail({
      name,
      email,
      phone: phone || "Não informado",
      subject,
      message,
    });

    if (!emailResult.success) {

    } else {

    }

    return NextResponse.json(
      { 
        message: "Mensagem enviada com sucesso!",
        emailSent: emailResult.success,
        messageId: savedMessage?.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro na API de contato:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
